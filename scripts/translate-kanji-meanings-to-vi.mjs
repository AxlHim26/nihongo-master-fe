/**
 * Script: Dịch tất cả meaning (EN → VI) trong data/kanji/*.json
 * - meaning là string (English) → thay bằng chuỗi tiếng Việt
 * - meaning là object { english: "..." } → thêm field vietnamese: "..."
 * - File không có meaning (kanji level) → gọi API lấy nghĩa tiếng Việt và thêm vào
 *
 * Chạy: node scripts/translate-kanji-meanings-to-vi.mjs
 *
 * Dùng Mega API (.env.local):
 *   MEGALLM_API_KEY=...
 *   MEGALLM_BASE_URL=https://api.megallm.ai
 *   MEGALLM_MODEL=gpt-4o-mini
 *   MEGALLM_BATCH_DELAY_MS=3000   (delay giữa các batch, 0 = tắt, giảm nếu API cho phép)
 *
 * Chạy nền (để Cursor/terminal không bị chặn):
 *   npm run translate:kanji &
 * Hoặc chạy xong đóng terminal vẫn chạy tiếp: nohup npm run translate:kanji > translate.log 2>&1 &
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

// Chỉ dùng Mega API (OpenAI-compatible)
const API_KEY = process.env.MEGALLM_API_KEY;
const rawBase = (process.env.MEGALLM_BASE_URL || "https://api.megallm.ai").replace(/\/$/, "");
const BASE_URL = rawBase.endsWith("/v1") ? rawBase : `${rawBase}/v1`;
const MODEL = process.env.MEGALLM_MODEL || "gpt-4o-mini";

if (!API_KEY) {
  console.error(
    "Thiếu MEGALLM_API_KEY. Thêm vào .env.local:\n  MEGALLM_API_KEY=...\n  MEGALLM_BASE_URL=https://api.megallm.ai\n  MEGALLM_MODEL=gpt-4o-mini",
  );
  process.exit(1);
}
console.log(`Using API: Mega (${MODEL})`);

const root = process.cwd();
const dataDir = path.join(root, "data", "kanji");
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

/**
 * Thu thập mọi chỗ cần dịch:
 * - meaning (string, English) → replace bằng VI
 * - meaning.english (object) → thêm meaning.vietnamese
 */
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
        results.push({
          path: [...pathStack, "meaning"],
          value: m,
          kind: "string",
        });
      } else if (m && typeof m === "object" && typeof m.english === "string" && m.english.trim() && isLikelyEnglish(m.english)) {
        results.push({
          path: [...pathStack, "meaning", "vietnamese"],
          value: m.english,
          kind: "object",
        });
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
      console.warn(`⏳ Rate limit. Đợi ${waitSec}s rồi thử lại (lần ${attempt}/5)...`);
      await new Promise((r) => setTimeout(r, waitSec * 1000));
      return translateBatch(texts, attempt + 1);
    }
    if (/insufficient balance|hết tiền|số dư/i.test(msg)) {
      console.error(
        "\n❌ Tài khoản API không đủ số dư (Insufficient Balance).\n   Vui lòng nạp thêm hoặc kiểm tra Mega/DeepSeek.\n",
      );
      process.exit(1);
    }
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      return translateBatch(texts, attempt + 1);
    }
    console.warn(`Batch failed: ${msg}`);
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

/** Lấy nghĩa tiếng Việt cho một chữ kanji (dùng khi file không có meaning). */
async function getVietnameseMeaningForKanji(kanjiChar, attempt = 1) {
  const prompt = `Cho chữ Hán Nhật (kanji): "${kanjiChar}". Trả lời bằng đúng một cụm từ tiếng Việt ngắn gọn là nghĩa phổ biến nhất của chữ này. Chỉ trả lời cụm từ tiếng Việt, không giải thích.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let response;
  try {
    response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "Chỉ trả lời bằng một cụm từ tiếng Việt ngắn." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
      signal: controller.signal,
    });
  } catch {
    clearTimeout(timeout);
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 1000));
      return getVietnameseMeaningForKanji(kanjiChar, attempt + 1);
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
      console.warn(`⏳ Rate limit (kanji). Đợi ${waitSec}s rồi thử lại (lần ${attempt}/5)...`);
      await new Promise((r) => setTimeout(r, waitSec * 1000));
      return getVietnameseMeaningForKanji(kanjiChar, attempt + 1);
    }
    if (/insufficient balance|hết tiền|số dư/i.test(msg)) {
      console.error(
        "\n❌ Tài khoản API không đủ số dư (Insufficient Balance).\n   Vui lòng nạp thêm hoặc kiểm tra Mega.\n",
      );
      process.exit(1);
    }
    return null;
  }
  const data = await response.json();
  const text = (data.choices?.[0]?.message?.content ?? "").trim();
  return text || null;
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

const files = await fs.readdir(dataDir);
const jsonFiles = files.filter((f) => f.endsWith(".json"));

const chunkSize = 4;
const delayBetweenBatchesMs = Math.max(0, Number(process.env.MEGALLM_BATCH_DELAY_MS) || 3000);
let processed = 0;
let addedMissingMeaning = 0;

for (const file of jsonFiles) {
  const filePath = path.join(dataDir, file);
  const raw = await fs.readFile(filePath, "utf-8");
  const json = JSON.parse(raw);
  const kanjiChar = json.id ?? file.replace(/\.json$/, "");

  const entries = collectMeaningTargets(json);

  // 1) Dịch các meaning đã có
  if (entries.length > 0) {
    const values = entries.map((e) => e.value);
    const uniqueValues = Array.from(new Set(values.filter((v) => !cache[v])));

    for (let i = 0; i < uniqueValues.length; i += chunkSize) {
      const chunk = uniqueValues.slice(i, i + chunkSize);
      const translated = await translateBatch(chunk);
      if (Array.isArray(translated)) {
        translated.forEach((text, idx) => {
          const source = chunk[idx];
          if (source != null && typeof text === "string" && text.trim()) cache[source] = text.trim();
        });
        await saveCache();
      }
      if (delayBetweenBatchesMs > 0 && i + chunkSize < uniqueValues.length) {
        await new Promise((r) => setTimeout(r, delayBetweenBatchesMs));
      }
    }

    entries.forEach((entry) => {
      const translated = cache[entry.value];
      if (typeof translated === "string" && translated.trim()) {
        setByPath(json, entry.path, translated);
      }
    });
  }

  // 2) File hoàn toàn không có meaning (cấp kanji) → thêm nghĩa tiếng Việt
  const hasMainMeaning =
    (typeof json.kanjialiveData?.meaning === "string" && json.kanjialiveData.meaning.trim()) ||
    (typeof json.jishoData?.meaning === "string" && json.jishoData.meaning.trim());
  const existingEnglish =
    json.kanjialiveData?.kanji?.meaning?.english ||
    json.kanjialiveData?.meaning ||
    json.jishoData?.meaning;

  if (!hasMainMeaning) {
    let viMeaning =
      (typeof existingEnglish === "string" && existingEnglish.trim() && cache[existingEnglish]) ||
      null;
    if (!viMeaning) {
      viMeaning = await getVietnameseMeaningForKanji(kanjiChar);
      if (viMeaning && existingEnglish) {
        cache[existingEnglish] = viMeaning;
        await saveCache();
      }
    }
    if (viMeaning) {
      if (json.kanjialiveData) {
        json.kanjialiveData.meaning = viMeaning;
        if (json.kanjialiveData.kanji?.meaning) {
          json.kanjialiveData.kanji.meaning.vietnamese = viMeaning;
          if (!json.kanjialiveData.kanji.meaning.english && existingEnglish)
            json.kanjialiveData.kanji.meaning.english = existingEnglish;
        } else if (json.kanjialiveData.kanji) {
          json.kanjialiveData.kanji.meaning = {
            english: existingEnglish || "",
            vietnamese: viMeaning,
          };
        }
      }
      if (json.jishoData) {
        json.jishoData.meaning = viMeaning;
      }
      addedMissingMeaning += 1;
    }
  }

  await fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf-8");
  processed += 1;
  if (processed % 100 === 0) {
    console.log(`Processed ${processed}/${jsonFiles.length} (added meaning: ${addedMissingMeaning})`);
  }
}

console.log(`Done. Processed ${processed} files. Added meaning for ${addedMissingMeaning} kanji.`);
