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
    // ignore
  }
};

await loadEnvFile();

const API_KEY = process.env.MEGALLM_API_KEY;
if (!API_KEY) {
  console.error("Thiếu MEGALLM_API_KEY. Thêm vào .env.local");
  process.exit(1);
}
const BASE_URL_RAW = process.env.MEGALLM_BASE_URL || "https://api.megallm.ai";
const BASE_URL = BASE_URL_RAW.replace(/\/v1\/?$/, "");
const MODEL = process.env.MEGALLM_MODEL || "gpt-4o-mini";

const root = process.cwd();
const dataDir = path.join(root, "data", "kanji");
const processedPath = path.join(root, "data", "kanji-processed.txt");
const cachePath = path.join(root, "data", "kanji-translation-cache.json");

const isUrl = (value) => typeof value === "string" && /^https?:\/\//i.test(value);

const isLikelyEnglish = (value) => {
  if (typeof value !== "string") return false;
  if (!value.trim()) return false;
  if (isUrl(value)) return false;
  return /[A-Za-z]/.test(value);
};

/** Collect: 1) meaning as string (English) -> replace with VI; 2) meaning as object with english -> add vietnamese */
function collectMeaningTargets(obj, pathStack = []) {
  const results = [];
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      results.push(...collectMeaningTargets(item, [...pathStack, String(index)]));
    });
    return results;
  }
  if (obj && typeof obj === "object") {
    if (typeof obj.meaning === "string" && obj.meaning.trim() && isLikelyEnglish(obj.meaning)) {
      results.push({ type: "replace", path: [...pathStack, "meaning"], value: obj.meaning });
    } else if (
      obj.meaning &&
      typeof obj.meaning === "object" &&
      typeof obj.meaning.english === "string" &&
      obj.meaning.english.trim()
    ) {
      results.push({
        type: "addVietnamese",
        path: [...pathStack, "meaning"],
        value: obj.meaning.english,
      });
    }

    Object.entries(obj).forEach(([key, value]) => {
      if (key === "meaning") return;
      results.push(...collectMeaningTargets(value, [...pathStack, key]));
    });
  }
  return results;
}

function getByPath(obj, pathParts) {
  let current = obj;
  for (const key of pathParts) {
    current = current?.[key];
  }
  return current;
}

function setByPath(obj, pathParts, newValue) {
  let current = obj;
  for (let i = 0; i < pathParts.length - 1; i += 1) {
    current = current[pathParts[i]];
  }
  current[pathParts[pathParts.length - 1]] = newValue;
}

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
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      return translateBatch(texts, attempt + 1);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      return translateBatch(texts, attempt + 1);
    }
    return null;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const match = content.match(/\[[\s\S]*\]/);
  const jsonText = match ? match[0] : content;
  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
};

// --- main
let processedSet = new Set();
try {
  const raw = await fs.readFile(processedPath, "utf-8");
  raw.split(/\r?\n/).forEach((line) => {
    const f = line.trim();
    if (f) processedSet.add(f);
  });
} catch {
  // empty
}

const allFiles = await fs.readdir(dataDir);
const jsonFiles = allFiles.filter((f) => f.endsWith(".json"));
const unprocessed = jsonFiles
  .filter((f) => !processedSet.has(f))
  .sort((a, b) => {
    const nameA = a.replace(/\.json$/, "");
    const nameB = b.replace(/\.json$/, "");
    if (nameA.length !== nameB.length) return nameA.length - nameB.length;
    return a.localeCompare(b);
  });

const toProcess = unprocessed.slice(0, 15);
if (toProcess.length === 0) {
  console.log("Không còn file nào chưa xử lý.");
  process.exit(0);
}

let cache = {};
try {
  const rawCache = await fs.readFile(cachePath, "utf-8");
  cache = JSON.parse(rawCache);
} catch {
  cache = {};
}

const chunkSize = 8;

for (const file of toProcess) {
  const filePath = path.join(dataDir, file);
  const raw = await fs.readFile(filePath, "utf-8");
  const json = JSON.parse(raw);

  const entries = collectMeaningTargets(json);
  if (entries.length === 0) {
    await fs.appendFile(processedPath, file + "\n", "utf-8");
    processedSet.add(file);
    continue;
  }

  const values = entries.map((e) => e.value);
  const uniqueValues = Array.from(new Set(values.filter((v) => !cache[v])));

  for (let i = 0; i < uniqueValues.length; i += chunkSize) {
    const chunk = uniqueValues.slice(i, i + chunkSize);
    const translated = await translateBatch(chunk);
    if (Array.isArray(translated)) {
      chunk.forEach((src, idx) => {
        if (src && translated[idx] && typeof translated[idx] === "string") {
          cache[src] = translated[idx];
        }
      });
      await fs.writeFile(cachePath, JSON.stringify(cache, null, 2), "utf-8");
    }
  }

  for (const entry of entries) {
    const translated = cache[entry.value];
    if (typeof translated !== "string" || !translated.trim()) continue;
    if (entry.type === "replace") {
      setByPath(json, entry.path, translated);
    } else if (entry.type === "addVietnamese") {
      const parent = getByPath(json, entry.path);
      if (parent && typeof parent === "object") parent.vietnamese = translated;
    }
  }

  await fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf-8");
  await fs.appendFile(processedPath, file + "\n", "utf-8");
  processedSet.add(file);
}

console.log("Đã xử lý: " + toProcess.join(", "));
