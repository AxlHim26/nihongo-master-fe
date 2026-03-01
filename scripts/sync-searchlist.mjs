import fs from "node:fs/promises";
import path from "node:path";

async function main() {
  const root = process.cwd();
  const searchlistPath = path.join(root, "src", "features", "kanji", "data", "searchlist.json");
  const kanjiDir = path.join(root, "data", "kanji");

  const searchlistRaw = await fs.readFile(searchlistPath, "utf-8");
  const searchlist = JSON.parse(searchlistRaw);

  const files = await fs.readdir(kanjiDir);
  const kanjiDataMap = {};

  // Process files in chunks of 500
  const CHUNK_SIZE = 500;
  for (let i = 0; i < files.length; i += CHUNK_SIZE) {
    const chunk = files.slice(i, i + CHUNK_SIZE);
    
    await Promise.all(
      chunk.map(async (file) => {
        if (!file.endsWith(".json") || file === "default.json" || file.startsWith("CDP-")) return;
        try {
          const raw = await fs.readFile(path.join(kanjiDir, file), "utf-8");
          const data = JSON.parse(raw);
          const k = data.id || file.replace(".json", "");
          
          let meaningObj = data.meaning || data.kanjialiveData?.meaning || data.jishoData?.meaning || null;
          if (meaningObj) {
            kanjiDataMap[k] = meaningObj;
          }
        } catch (e) {
          // ignore
        }
      })
    );
  }

  let updatedCount = 0;

  for (const entry of searchlist) {
    const k = entry.k;
    const localMeaning = kanjiDataMap[k];
    
    if (localMeaning) {
      // local meaning could be a string or an object { vi, en }
      // The frontend will now support an object
      entry.m = localMeaning;
      updatedCount++;
    } else if (typeof entry.m === "string" && entry.m) {
      // Convert existing english string to { vi: '', en: m } so format matches
      entry.m = { en: entry.m };
      updatedCount++;
    }
  }

  await fs.writeFile(searchlistPath, JSON.stringify(searchlist, null, 0), "utf-8");
  console.log(`Updated ${updatedCount} entries in searchlist.`);
}

main().catch(console.error);
