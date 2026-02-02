#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
const processedPath = path.join(root, "data", "kanji-processed.txt");
const dataDir = path.join(root, "data", "kanji");
const outPath = path.join(root, "data", "next-15-batch.txt");
const processedRaw = await fs.readFile(processedPath, "utf-8");
const processedSet = new Set(processedRaw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean));
const allFiles = await fs.readdir(dataDir);
const jsonFiles = allFiles.filter((f) => f.endsWith(".json"));
const unprocessed = jsonFiles.filter((f) => !processedSet.has(f)).sort((a, b) => a.length - b.length || a.localeCompare(b));
const toProcess = unprocessed.slice(0, 15);
await fs.writeFile(outPath, toProcess.join("\n") + "\n", "utf-8");
console.log(toProcess.join("\n"));
