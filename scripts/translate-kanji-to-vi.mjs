import fs from "node:fs/promises";
import path from "node:path";

const loadEnvFile = async () => {
  const envPath = path.join(process.cwd(), ".env.local");
  try {
    const raw = await fs.readFile(envPath, "utf-8");
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const [key, ...rest] = trimmed.split("=");
      if (!key) return;
      const value = rest.join("=").trim().replace(/^"|"$/g, "");
      if (!process.env[key]) process.env[key] = value;
    });
  } catch {
    // ignore if missing
  }
};

await loadEnvFile();

const API_KEY = process.env.MEGALLM_API_KEY;
const BASE_URL_RAW = process.env.MEGALLM_BASE_URL || "https://api.megallm.ai";
const BASE_URL = BASE_URL_RAW.replace(/\/v1\/?$/, "");
const MODEL = process.env.MEGALLM_MODEL || "gpt-4o-mini";

if (!API_KEY) {
  console.error("Missing MEGALLM_API_KEY");
  process.exit(1);
}

const root = process.cwd();
const dataDir = path.join(root, "data", "kanji");
const cachePath = path.join(root, "data", "kanji-translation-cache.json");

const isUrl = (value) => typeof value === "string" && /^https?:\/\//i.test(value);

const isLikelyEnglish = (value) => {
  if (typeof value !== "string") return false;
  if (!value.trim()) return false;
  if (isUrl(value)) return false;
  if (/^[a-z\-\s]+$/i.test(value) && value.length <= 8) return false;
  return /[A-Za-z]/.test(value);
};

const isJapaneseText = (value) => {
  if (typeof value !== "string") return false;
  return /[\u3040-\u30ff\u4e00-\u9faf]/.test(value);
};

const collectMeaningTargets = (obj, pathStack = []) => {
  const results = [];
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      results.push(...collectMeaningTargets(item, [...pathStack, String(index)]));
    });
    return results;
  }
  if (obj && typeof obj === "object") {
    const hasMeaning = typeof obj.meaning === "string" && obj.meaning.trim();
    if (hasMeaning && isLikelyEnglish(obj.meaning)) {
      results.push({ path: [...pathStack, "meaning"], value: obj.meaning });
    }

    if (!hasMeaning) {
      const japaneseCandidate =
        (typeof obj.japanese === "string" && obj.japanese.trim() && obj.japanese) ||
        (typeof obj.kanji === "string" && obj.kanji.trim() && obj.kanji) ||
        (typeof obj.term === "string" && obj.term.trim() && obj.term) ||
        (typeof obj.word === "string" && obj.word.trim() && obj.word) ||
        (typeof obj.reading === "string" && obj.reading.trim() && obj.reading) ||
        "";
      if (japaneseCandidate && isJapaneseText(japaneseCandidate)) {
        results.push({
          path: [...pathStack, "meaning"],
          value: japaneseCandidate,
          addIfMissing: true,
        });
      }
    }

    Object.entries(obj).forEach(([key, value]) => {
      if (key === "meaning") return;
      results.push(...collectMeaningTargets(value, [...pathStack, key]));
    });
  }
  return results;
};

const setByPath = (obj, pathParts, newValue, addIfMissing = false) => {
  let current = obj;
  for (let i = 0; i < pathParts.length - 1; i += 1) {
    const key = pathParts[i];
    current = current[key];
  }
  const last = pathParts[pathParts.length - 1];
  if (addIfMissing && typeof current[last] === "string" && current[last].trim()) {
    return;
  }
  current[last] = newValue;
};

const translateBatch = async (texts, attempt = 1) => {
  const prompt = [
    "Bạn là dịch giả tiếng Nhật/Anh -> tiếng Việt.",
    "Dịch các cụm sau sang tiếng Việt tự nhiên, ngắn gọn.",
    "Trả về đúng JSON array theo thứ tự.",
    "Không thêm chú thích.",
    "Danh sách:",
    ...texts.map((text, index) => `${index + 1}. ${text}`),
  ].join("\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);
  let response;
  try {
    response = await fetch(`${BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "Chỉ trả về JSON array. Không giải thích." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeout);
    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      return translateBatch(texts, attempt + 1);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorText = await response.text();
    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      return translateBatch(texts, attempt + 1);
    }
    console.warn(`Batch failed: ${errorText}`);
    return null;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const match = content.match(/\[[\s\S]*\]/);
  const jsonText = match ? match[0] : content;
  return JSON.parse(jsonText);
};

let cache = {};
try {
  const rawCache = await fs.readFile(cachePath, "utf-8");
  cache = JSON.parse(rawCache);
} catch {
  cache = {};
}

const files = await fs.readdir(dataDir);
const jsonFiles = files.filter((file) => file.endsWith(".json"));

const concurrency = 4;
const chunkSize = 4;

let processed = 0;
for (const file of jsonFiles) {
  const filePath = path.join(dataDir, file);
  const raw = await fs.readFile(filePath, "utf-8");
  const json = JSON.parse(raw);

  const entries = collectMeaningTargets(json);
  if (entries.length === 0) {
    processed += 1;
    continue;
  }

  const values = entries.map((entry) => entry.value);
  const uniqueValues = Array.from(new Set(values.filter((value) => !cache[value])));

  const batches = [];
  for (let i = 0; i < uniqueValues.length; i += chunkSize) {
    batches.push(uniqueValues.slice(i, i + chunkSize));
  }

  for (let i = 0; i < batches.length; i += concurrency) {
    const slice = batches.slice(i, i + concurrency);
    const results = await Promise.all(slice.map((chunk) => translateBatch(chunk)));
    results.forEach((translated, index) => {
      if (!Array.isArray(translated)) return;
      const sourceChunk = slice[index];
      translated.forEach((text, idx) => {
        const source = sourceChunk[idx];
        if (source && typeof text === "string") cache[source] = text;
      });
    });
    await fs.writeFile(cachePath, JSON.stringify(cache, null, 2), "utf-8");
  }

  entries.forEach((entry) => {
    const translated = cache[entry.value];
    if (typeof translated === "string" && translated.trim()) {
      setByPath(json, entry.path, translated, entry.addIfMissing);
    }
  });

  await fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf-8");
  processed += 1;
  if (processed % 50 === 0) {
    console.log(`Processed ${processed}/${jsonFiles.length}`);
  }
}

console.log(`Done. Processed ${processed} files.`);
