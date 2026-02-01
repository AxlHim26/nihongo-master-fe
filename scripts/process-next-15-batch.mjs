/**
 * Xử lý đúng 15 file kanji CHƯA có trong kanji-processed.txt:
 * - Ưu tiên tên ngắn (1 ký tự trước)
 * - Dịch meaning EN -> VI (string thay bằng VI, object thêm vietnamese)
 * - Append 15 tên file vào kanji-processed.txt
 * Chạy: node scripts/process-next-15-batch.mjs
 */

import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data", "kanji");
const processedPath = path.join(root, "data", "kanji-processed.txt");
const cachePath = path.join(root, "data", "kanji-translation-cache.json");

const isUrl = (v) => typeof v === "string" && /^https?:\/\//i.test(v);
const vietnameseDiacritics = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
const isLikelyEnglish = (v) => {
  if (typeof v !== "string" || !v.trim() || isUrl(v) || vietnameseDiacritics.test(v)) return false;
  return /[A-Za-z]/.test(v);
};

function collectMeaningTargets(obj, pathStack = []) {
  const results = [];
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => results.push(...collectMeaningTargets(item, [...pathStack, String(i)])));
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

async function translateBatch(texts) {
  const prompt = [
    "Bạn là dịch giả tiếng Anh/tiếng Nhật -> tiếng Việt.",
    "Dịch các cụm sau sang tiếng Việt tự nhiên, ngắn gọn.",
    "Trả về đúng JSON array theo thứ tự, mỗi phần tử là chuỗi tiếng Việt. Không chú thích.",
    "Danh sách:",
    ...texts.map((t, i) => `${i + 1}. ${t}`),
  ].join("\n");
  const API_KEY = process.env.MEGALLM_API_KEY;
  const base = (process.env.MEGALLM_BASE_URL || "https://api.megallm.ai").replace(/\/$/, "");
  const BASE_URL = base.endsWith("/v1") ? base : base + "/v1";
  const MODEL = process.env.MEGALLM_MODEL || "gpt-4o-mini";
  if (!API_KEY) return null;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 60000);
  let res;
  try {
    res = await fetch(`${BASE_URL}/chat/completions`, {
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
  } catch (e) {
    clearTimeout(t);
    return null;
  }
  clearTimeout(t);
  if (!res.ok) return null;
  const data = await res.json();
  const content = (data.choices?.[0]?.message?.content ?? "").trim();
  const match = content.match(/\[[\s\S]*\]/);
  try {
    return JSON.parse(match ? match[0] : content);
  } catch {
    return null;
  }
}

// Load processed list
const processedRaw = await fs.readFile(processedPath, "utf-8");
const processedSet = new Set(processedRaw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean));

// All json (exclude CDP-*, default)
const allFiles = (await fs.readdir(dataDir)).filter(
  (f) => f.endsWith(".json") && !f.startsWith("CDP-") && f !== "default.json"
);
const unprocessed = allFiles.filter((f) => !processedSet.has(f));
const withLen = unprocessed.map((f) => ({ name: f, len: f.replace(/\.json$/, "").length }));
withLen.sort((a, b) => a.len - b.len || a.name.localeCompare(b.name));
const toProcess = withLen.slice(0, 15).map((x) => x.name);

if (toProcess.length === 0) {
  console.log("Không còn file nào chưa xử lý.");
  process.exit(0);
}

// Load cache
let cache = {};
try {
  cache = JSON.parse(await fs.readFile(cachePath, "utf-8"));
} catch {}

const saveCache = () => fs.writeFile(cachePath, JSON.stringify(cache, null, 2), "utf-8");

// Load .env.local for API
try {
  const envPath = path.join(root, ".env.local");
  const raw = await fs.readFile(envPath, "utf-8");
  raw.split(/\r?\n/).forEach((line) => {
    const t = line.trim();
    if (!t || t.startsWith("#")) return;
    const [key, ...rest] = t.split("=");
    if (key && !process.env[key]) process.env[key] = rest.join("=").trim().replace(/^"|"$/g, "");
  });
} catch {}

for (const file of toProcess) {
  const filePath = path.join(dataDir, file);
  const raw = await fs.readFile(filePath, "utf-8");
  const json = JSON.parse(raw);
  const entries = collectMeaningTargets(json);

  const toTranslate = entries.map((e) => e.value);
  const unique = [...new Set(toTranslate.filter((v) => !cache[v]))];

  for (let i = 0; i < unique.length; i += 5) {
    const chunk = unique.slice(i, i + 5);
    const translated = await translateBatch(chunk);
    if (Array.isArray(translated)) {
      translated.forEach((text, idx) => {
        const src = chunk[idx];
        if (src != null && typeof text === "string" && text.trim()) cache[src] = text.trim();
      });
      await saveCache();
    }
    if (i + 5 < unique.length) await new Promise((r) => setTimeout(r, 2000));
  }

  entries.forEach((entry) => {
    const vi = cache[entry.value];
    if (typeof vi === "string" && vi.trim()) setByPath(json, entry.path, vi);
  });

  await fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf-8");
}

await fs.appendFile(processedPath, "\n" + toProcess.join("\n") + "\n", "utf-8");
console.log("Đã xử lý: " + toProcess.join(", "));
