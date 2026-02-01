/**
 * Xử lý đúng 15 file kanji CHƯA có trong kanji-processed.txt.
 * Chỉ dùng cache + fallback từ điển (không gọi API).
 * - meaning là string (English) → thay bằng tiếng Việt
 * - meaning là object { english } → thêm vietnamese
 * Append 15 tên file vào kanji-processed.txt.
 * Chạy: node scripts/process-15-cache-only.mjs
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
  if (typeof v !== "string" || !v.trim()) return false;
  if (isUrl(v)) return false;
  if (vietnameseDiacritics.test(v)) return false;
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
  for (let i = 0; i < pathParts.length - 1; i++) {
    const key = pathParts[i];
    if (current[key] == null) return;
    current = current[key];
  }
  current[pathParts[pathParts.length - 1]] = newValue;
}

const FALLBACK = {
  "discrimination, dispose of, distinguish": "phân biệt, xử lý, phân biệt",
  "discrimination": "phân biệt",
  "dispose of": "xử lý",
  "distinguish": "phân biệt",
  "deceive, hide, conceal, flee": "lừa dối, ẩn, che giấu, chạy trốn",
  "deceive": "lừa dối",
  "hide": "ẩn",
  "conceal": "che giấu",
  "flee": "chạy trốn",
  "bitter": "đắng",
  "walk": "đi bộ",
  "fleeing into hiding": "chạy trốn ẩn náu",
  "seclusion from the world, monastic seclusion": "ẩn dật, xuất gia",
  "to discern (e.g. right from wrong), to discriminate, to distinguish, to know (manners, one's place, etc.), to understand, to bear in mind": "phân biệt (đúng sai), hiểu, ghi nhớ",
  "speech, tongue, talk, eloquence, dialect, brogue, accent, bento, Japanese box lunch, petal, valve, Oversight Department, division of the daijokan under the ritsuryō system responsible for controlling central and provincial governmental offices": "diễn thuyết, lưỡi, nói, hùng biện, phương ngữ, giọng, hộp cơm bento, cánh hoa, van",
  "strong person, person putting on a brave front, bamboo tube with holes drilled in it (used as a stand for kitchen utensils, fans, etc.), checks, plaid, checked pattern": "người mạnh, người tỏ ra dũng cảm, ô caro",
  "discernment, clear analysis, clear expression, distinguished speech": "sáng suốt, phân tích rõ, diễn đạt rõ",
  "finishing one's business, settling an affair": "hoàn thành công việc, giải quyết việc",
  "broth": "nước dùng",
};

function translate(en, cache) {
  const key = (en || "").trim();
  if (!key) return null;
  return cache[key] || FALLBACK[key] || null;
}

async function main() {
  const processedRaw = await fs.readFile(processedPath, "utf-8");
  const processedSet = new Set(
    processedRaw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  );

  const allFiles = await fs.readdir(dataDir);
  const jsonFiles = allFiles.filter(
    (f) => f.endsWith(".json") && f !== "default.json" && !f.startsWith("CDP-")
  );
  const unprocessed = jsonFiles.filter((f) => !processedSet.has(f));

  const nameLen = (f) => f.replace(/\.json$/, "").length;
  unprocessed.sort((a, b) => {
    const da = nameLen(a);
    const db = nameLen(b);
    if (da !== db) return da - db;
    return a.localeCompare(b);
  });

  const toProcess = unprocessed.slice(0, 15);
  if (toProcess.length === 0) {
    console.log("Không còn file nào chưa xử lý.");
    process.exit(0);
  }

  let cache = {};
  try {
    cache = JSON.parse(await fs.readFile(cachePath, "utf-8"));
  } catch {
    cache = {};
  }

  for (const file of toProcess) {
    const filePath = path.join(dataDir, file);
    const raw = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(raw);
    const entries = collectMeaningTargets(json);

    const resolved = new Map();
    for (const e of entries) {
      const vi = translate(e.value, cache);
      if (vi) resolved.set(JSON.stringify(e.path), vi);
    }

    entries.forEach((entry) => {
      const vi = resolved.get(JSON.stringify(entry.path));
      if (vi) setByPath(json, entry.path, vi);
    });

    if (json.jishoData?.radical?.meaning && isLikelyEnglish(json.jishoData.radical.meaning)) {
      const vi = translate(json.jishoData.radical.meaning, cache);
      if (vi) json.jishoData.radical.meaning = vi;
    }

    await fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf-8");
    console.log("OK:", file);
  }

  await fs.appendFile(
    processedPath,
    "\n" + toProcess.join("\n") + "\n",
    "utf-8"
  );
  console.log("\nĐã xử lý:", toProcess.join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
