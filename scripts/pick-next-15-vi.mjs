#!/usr/bin/env node
/**
 * Chỉ in ra 15 file kanji chưa xử lý (ưu tiên tên ngắn).
 * Dùng để biết danh sách trước khi chạy process-15-next-vi.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data", "kanji");
const processedPath = path.join(root, "data", "kanji-processed.txt");

let processedRaw = "";
try {
  processedRaw = await fs.readFile(processedPath, "utf-8");
} catch {
  // ignore
}
const processedSet = new Set(
  processedRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
);

const allFiles = await fs.readdir(dataDir);
const jsonFiles = allFiles.filter((f) => f.endsWith(".json"));
const unprocessed = jsonFiles.filter((f) => !processedSet.has(f));
const byLength = unprocessed.slice().sort((a, b) => {
  const lenA = a.length;
  const lenB = b.length;
  if (lenA !== lenB) return lenA - lenB;
  return a.localeCompare(b);
});
const toProcess = byLength.slice(0, 15);

console.log(toProcess.join("\n"));
