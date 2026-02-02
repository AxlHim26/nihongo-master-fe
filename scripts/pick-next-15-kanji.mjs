/**
 * Chỉ in ra 15 file kanji tiếp theo cần xử lý (không gọi API, không ghi file).
 * node scripts/pick-next-15-kanji.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data", "kanji");
const processedPath = path.join(root, "data", "kanji-processed.txt");

const raw = await fs.readFile(processedPath, "utf-8").catch(() => "");
const processedSet = new Set(
  raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
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
const fifteen = unprocessed.slice(0, 15);

console.log(fifteen.join("\n"));
