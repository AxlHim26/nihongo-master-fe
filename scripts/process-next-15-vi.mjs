#!/usr/bin/env node
/**
 * Chọn đúng 15 file .json trong data/kanji CHƯA có trong kanji-processed.txt (ưu tiên tên ngắn).
 * Với mỗi file: dịch meaning EN→VI (string thay bằng VI, object thêm vietnamese).
 * Append 15 tên file vào cuối data/kanji-processed.txt.
 * Chạy: node scripts/process-next-15-vi.mjs
 */
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
const rawBase = (process.env.MEGALLM_BASE_URL || "https://api.megallm.ai").replace(/\/$/, "");
const BASE_URL = rawBase.endsWith("/v1") ? rawBase : `${rawBase}/v1`;
const MODEL = process.env.MEGALLM_MODEL || "gpt-4o-mini";

if (!API_KEY) {
  console.error("Thiếu MEGALLM_API_KEY trong .env.local");
  process.exit(1);
}

const root = process.cwd();
const dataDir = path.join(root, "data", "kanji");
const processedPath = path.join(root, "data", "kanji-processed.txt");
const cachePath = path.join(root, "data", "kanji-translation-cache.json");

const isUrl = (value) => typeof value === "string" && /^https?:\/\//i.test(value);
const vietnameseDiacritics = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
const isLikelyEnglish = (value) => {
  if (typeof value !== "string") return false;
  if (!value.trim()) return false;
  if (isUrl(value)) return false;
  if (vietnameseDiacritics.test(value)) return false;
  return /[A-Za-z]/.test(value);
};

function collectMeaningTargets(obj, pathStack = []) {
  const results = [];
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      results.push(...collectMeaningTargets(item, [...pathStack, String(index)]));
    });
    return results;
  }
  if (obj && typeof obj === "object") {
    if (Object.prototype.hasOwnProperty.call(obj, "meaning")) {
      const m = obj.meaning;
      if (typeof m === "string" && m.trim() && isLikelyEnglish(m)) {
        results.push({ path: [...pathStack, "meaning"], value: m, kind: "string" });
      } else if (m && typeof m === "object" && typeof m.english === "string" && m.english.trim() && isLikelyEnglish(m.english)) {
        results.push({ path: [...pathStack, "meaning", "vietnamese"], value: m.english, kind: "object" });
      }
    }
    Object.entries(obj).forEach(([key, value]) => {
      if (key === "meaning") return;
      results.push(...collectMeaningTargets(value, [...pathStack, key]));
    });
  }
  return results;
}

function setByPath(obj, pathParts, newValue) {
  let current = obj;
  for (let i = 0; i < pathParts.length - 1; i += 1) {
    const key = pathParts[i];
    if (current[key] == null) return;
    current = current[key];
  }
  current[pathParts[pathParts.length - 1]] = newValue;
}

async function translateBatch(texts, attempt = 1) {
  const prompt = [
    "Bạn là dịch giả tiếng Anh/tiếng Nhật -> tiếng Việt.",
    "Dịch các cụm sau sang tiếng Việt tự nhiên, ngắn gọn (từ, cụm từ, hoặc câu ngắn).",
    "Trả về đúng JSON array theo thứ tự, mỗi phần tử là chuỗi tiếng Việt tương ứng.",
    "Không thêm chú thích.",
    "Danh sách:",
    ...texts.map((text, index) => `${index + 1}. ${text}`),
  ].join("\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);
  let response;
  try {
    response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
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
  } catch (err) {
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
    const errText = await response.text();
    let errJson;
    try {
      errJson = JSON.parse(errText);
    } catch {
      errJson = {};
    }
    const msg = errJson?.message ?? errJson?.error?.message ?? errText;
    const isRateLimit = response.status === 429 || /rate_limit|rate limit/i.test(String(errJson?.error ?? msg));
    if (isRateLimit && attempt <= 5) {
      const waitSec = Math.min(Math.max(Number(errJson?.retryAfter) || 30, 5), 120);
      await new Promise((r) => setTimeout(r, waitSec * 1000));
      return translateBatch(texts, attempt + 1);
    }
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
}

// Load processed set & pick 15 unprocessed
const rawProcessed = await fs.readFile(processedPath, "utf-8").catch(() => "");
const processedSet = new Set(rawProcessed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean));
const allFiles = await fs.readdir(dataDir);
const jsonFiles = allFiles.filter((f) => f.endsWith(".json") && f !== "default.json" && !f.startsWith("CDP-"));
const nameLen = (f) => (f.endsWith(".json") ? f.slice(0, -5) : f).length;
const unprocessed = jsonFiles
  .filter((f) => !processedSet.has(f))
  .sort((a, b) => nameLen(a) - nameLen(b) || a.localeCompare(b));
const toProcess = unprocessed.slice(0, 15);

if (toProcess.length === 0) {
  console.log("Không còn file nào chưa xử lý.");
  process.exit(0);
}

// Load cache
let cache = {};
try {
  const rawCache = await fs.readFile(cachePath, "utf-8");
  cache = JSON.parse(rawCache);
} catch {
  cache = {};
}
const saveCache = () => fs.writeFile(cachePath, JSON.stringify(cache, null, 2), "utf-8");

const BATCH_SIZE = 8;
const DELAY_MS = Math.max(0, Number(process.env.MEGALLM_BATCH_DELAY_MS) || 2000);

for (const file of toProcess) {
  const filePath = path.join(dataDir, file);
  const raw = await fs.readFile(filePath, "utf-8");
  const json = JSON.parse(raw);
  const entries = collectMeaningTargets(json);

  if (entries.length > 0) {
    const values = entries.map((e) => e.value);
    const uniqueValues = Array.from(new Set(values.filter((v) => !cache[v])));

    for (let i = 0; i < uniqueValues.length; i += BATCH_SIZE) {
      const chunk = uniqueValues.slice(i, i + BATCH_SIZE);
      const translated = await translateBatch(chunk);
      if (Array.isArray(translated)) {
        translated.forEach((text, idx) => {
          const source = chunk[idx];
          if (source != null && typeof text === "string" && text.trim()) cache[source] = text.trim();
        });
        await saveCache();
      }
      if (DELAY_MS > 0 && i + BATCH_SIZE < uniqueValues.length) {
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
    }

    entries.forEach((entry) => {
      const translated = cache[entry.value];
      if (typeof translated === "string" && translated.trim()) {
        setByPath(json, entry.path, translated);
      }
    });
  }

  await fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf-8");
}

await fs.appendFile(processedPath, (rawProcessed.endsWith("\n") ? "" : "\n") + toProcess.join("\n") + "\n", "utf-8");
console.log("Đã xử lý:", toProcess.join(", "));
