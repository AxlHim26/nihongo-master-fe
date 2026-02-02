/**
 * Xử lý đúng 15 file kanji CHƯA có trong kanji-processed.txt.
 * Chỉ dùng cache dịch (không gọi API). Nếu cache không có thì giữ nguyên tiếng Anh.
 *
 * Chạy: node scripts/process-next-15-cache-only.mjs
 * DRY_RUN=1: chỉ in 15 tên file (không ghi file).
 * WRITE_NEXT=1: ghi 15 tên file vào data/next-15-batch.txt rồi thoát (để dùng cho batch khác).
 */
import fs from "node:fs/promises";
import path from "node:path";

const DRY_RUN = process.env.DRY_RUN === "1";
const WRITE_NEXT = process.env.WRITE_NEXT === "1";
const root = process.cwd();
const dataDir = path.join(root, "data", "kanji");
const processedPath = path.join(root, "data", "kanji-processed.txt");
const cachePath = path.join(root, "data", "kanji-translation-cache.json");

const vietnameseDiacritics = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
const isLikelyEnglish = (value) => {
  if (typeof value !== "string") return false;
  if (!value.trim()) return false;
  if (/^https?:\/\//i.test(value)) return false;
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
      } else if (
        m &&
        typeof m === "object" &&
        typeof m.english === "string" &&
        m.english.trim() &&
        isLikelyEnglish(m.english)
      ) {
        const hasVi = typeof m.vietnamese === "string" && m.vietnamese.trim();
        if (!hasVi) {
          results.push({
            path: [...pathStack, "meaning", "vietnamese"],
            value: m.english,
            kind: "object",
          });
        }
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

const rawProcessed = await fs.readFile(processedPath, "utf-8").catch(() => "");
const processedSet = new Set(
  rawProcessed.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
);

const allFiles = await fs.readdir(dataDir);
const jsonFiles = allFiles.filter((f) => f.endsWith(".json"));
const nameLen = (f) => f.replace(/\.json$/, "").length;
const unprocessed = jsonFiles
  .filter((f) => !processedSet.has(f))
  .sort((a, b) => {
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

if (DRY_RUN) {
  console.log("DRY_RUN – 15 file sẽ xử lý:", toProcess.join(", "));
  process.exit(0);
}
if (WRITE_NEXT) {
  await fs.writeFile(
    path.join(root, "data", "next-15-batch.txt"),
    toProcess.join("\n") + "\n",
    "utf-8",
  );
  console.log("Đã ghi 15 file vào data/next-15-batch.txt:", toProcess.join(", "));
  process.exit(0);
}

let cache = {};
try {
  const rawCache = await fs.readFile(cachePath, "utf-8");
  cache = JSON.parse(rawCache);
} catch {
  cache = {};
}

for (const file of toProcess) {
  const filePath = path.join(dataDir, file);
  const raw = await fs.readFile(filePath, "utf-8");
  const json = JSON.parse(raw);

  const entries = collectMeaningTargets(json);
  entries.forEach((entry) => {
    const translated = cache[entry.value];
    if (typeof translated === "string" && translated.trim()) {
      setByPath(json, entry.path, translated);
    }
  });

  const hasMainMeaning =
    (typeof json.kanjialiveData?.meaning === "string" && json.kanjialiveData.meaning.trim()) ||
    (typeof json.jishoData?.meaning === "string" && json.jishoData.meaning.trim());
  const existingEnglish =
    json.kanjialiveData?.kanji?.meaning?.english ||
    json.kanjialiveData?.meaning ||
    json.jishoData?.meaning;

  if (!hasMainMeaning && existingEnglish) {
    const viMeaning = cache[existingEnglish];
    if (typeof viMeaning === "string" && viMeaning.trim()) {
      if (json.kanjialiveData) {
        json.kanjialiveData.meaning = viMeaning;
        if (json.kanjialiveData.kanji?.meaning) {
          json.kanjialiveData.kanji.meaning.vietnamese = viMeaning;
          if (!json.kanjialiveData.kanji.meaning.english)
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
    }
  }

  await fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf-8");
  console.log("  ✓", file);
}

const endsWithNewline = rawProcessed.length > 0 && rawProcessed.slice(-1) === "\n";
await fs.appendFile(
  processedPath,
  (endsWithNewline ? "" : "\n") + toProcess.join("\n") + "\n",
  "utf-8",
);
console.log("\nĐã xử lý: " + toProcess.join(", "));
