import fs from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
const dataDir = path.join(root, "data", "kanji");
const processedPath = path.join(root, "data", "kanji-processed.txt");
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
    const na = a.replace(/\.json$/, "");
    const nb = b.replace(/\.json$/, "");
    if (na.length !== nb.length) return na.length - nb.length;
    return na.localeCompare(nb);
  });
const toProcess = unprocessed.slice(0, 15);
console.log(toProcess.join("\n"));
