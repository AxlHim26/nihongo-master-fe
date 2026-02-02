#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data", "kanji");
const processedPath = path.join(root, "data", "kanji-processed.txt");

let processedRaw = "";
try {
  processedRaw = await fs.readFile(processedPath, "utf-8");
} catch {
  processedRaw = "";
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

const nameLen = (f) => f.replace(/\.json$/, "").length;
unprocessed.sort((a, b) => {
  const la = nameLen(a);
  const lb = nameLen(b);
  if (la !== lb) return la - lb;
  return a.localeCompare(b);
});

const toProcess = unprocessed.slice(0, 15);
console.log(toProcess.join("\n"));
