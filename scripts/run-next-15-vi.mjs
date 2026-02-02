#!/usr/bin/env node
/**
 * One-off: list 15 unprocessed kanji files (by name length), then run process-15-unprocessed-vi.
 * Usage: node scripts/run-next-15-vi.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data", "kanji");
const processedPath = path.join(root, "data", "kanji-processed.txt");

const processedRaw = await fs.readFile(processedPath, "utf-8");
const processedSet = new Set(processedRaw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean));
const allFiles = await fs.readdir(dataDir);
const jsonFiles = allFiles.filter((f) => f.endsWith(".json"));
const unprocessed = jsonFiles.filter((f) => !processedSet.has(f));
unprocessed.sort((a, b) => a.length - b.length || a.localeCompare(b));
const next15 = unprocessed.slice(0, 15);
console.log("Next 15 to process:", next15.join(", "));
if (next15.length > 0) {
  execSync("node scripts/process-15-unprocessed-vi.mjs", { stdio: "inherit", cwd: root });
}
