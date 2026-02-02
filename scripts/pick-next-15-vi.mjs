/**
 * Chỉ chọn 15 file chưa xử lý (ưu tiên tên ngắn) và in ra.
 * Không gọi API, không ghi file.
 */
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data", "kanji");
const processedPath = path.join(root, "data", "kanji-processed.txt");

const processedRaw = await fs.readFile(processedPath, "utf-8").catch(() => "");
const processedSet = new Set(
  processedRaw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
);
const allFiles = await fs.readdir(dataDir);
const jsonFiles = allFiles.filter((f) => f.endsWith(".json"));
const unprocessed = jsonFiles.filter((f) => !processedSet.has(f));
const byLength = unprocessed.slice().sort((a, b) => {
  if (a.length !== b.length) return a.length - b.length;
  return a.localeCompare(b);
});
const toProcess = byLength.slice(0, 15);
console.log(JSON.stringify(toProcess));