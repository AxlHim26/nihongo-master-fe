/**
 * Chỉ chọn 15 file kanji chưa xử lý (ưu tiên tên ngắn), ghi ra data/kanji-next-15.txt
 * Chạy: node scripts/pick-next-15-kanji.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data", "kanji");
const processedPath = path.join(root, "data", "kanji-processed.txt");
const outPath = path.join(root, "data", "kanji-next-15.txt");

const processedRaw = await fs.readFile(processedPath, "utf-8");
const processedSet = new Set(
  processedRaw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
);

const allFiles = await fs.readdir(dataDir);
const jsonFiles = allFiles.filter(
  (f) => f.endsWith(".json") && f !== "default.json" && !f.startsWith("CDP-")
);
const unprocessed = jsonFiles
  .filter((f) => !processedSet.has(f))
  .sort((a, b) => {
    const nameA = a.replace(/\.json$/, "");
    const nameB = b.replace(/\.json$/, "");
    const lenA = nameA.length;
    const lenB = nameB.length;
    if (lenA !== lenB) return lenA - lenB;
    return a.localeCompare(b);
  });

const next15 = unprocessed.slice(0, 15);
await fs.writeFile(outPath, next15.join("\n") + "\n", "utf-8");
console.log(next15.join(", "));
