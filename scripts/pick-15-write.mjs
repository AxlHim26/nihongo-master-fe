#!/usr/bin/env node
/**
 * Chọn 15 file .json chưa có trong kanji-processed.txt (ưu tiên tên ngắn).
 * Ghi danh sách vào data/next-15-names.txt (mỗi dòng một tên file).
 * Chạy: node scripts/pick-15-write.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data", "kanji");
const processedPath = path.join(root, "data", "kanji-processed.txt");
const outPath = path.join(root, "data", "next-15-names.txt");

const raw = await fs.readFile(processedPath, "utf-8").catch(() => "");
const processedSet = new Set(raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean));
const files = await fs.readdir(dataDir);
const jsonFiles = files.filter((f) => f.endsWith(".json") && f !== "default.json" && !f.startsWith("CDP-"));
const nameLen = (f) => (f.endsWith(".json") ? f.slice(0, -5) : f).length;
const unprocessed = jsonFiles
  .filter((f) => !processedSet.has(f))
  .sort((a, b) => nameLen(a) - nameLen(b) || a.localeCompare(b));
const toProcess = unprocessed.slice(0, 15);

await fs.writeFile(outPath, toProcess.join("\n") + "\n", "utf-8");
console.log("Next 15:", toProcess.join(", "));
