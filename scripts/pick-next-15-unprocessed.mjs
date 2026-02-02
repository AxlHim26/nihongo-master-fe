/**
 * In ra 15 file kanji CHƯA có trong kanji-processed.txt (ưu tiên tên ngắn).
 * Chạy: node scripts/pick-next-15-unprocessed.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data", "kanji");
const processedPath = path.join(root, "data", "kanji-processed.txt");

let processedRaw = "";
try {
  processedRaw = await fs.readFile(processedPath, "utf-8");
} catch {}
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
const next15 = byLength.slice(0, 15);
console.log(next15.join("\n"));
