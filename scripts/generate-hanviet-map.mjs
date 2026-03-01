import fs from "node:fs/promises";
import path from "node:path";

async function main() {
  const root = process.cwd();
  const kanjiDir = path.join(root, "data", "kanji");
  const outFile = path.join(root, "src", "features", "kanji", "data", "hanviet-map.json");

  const files = await fs.readdir(kanjiDir);
  const mapList = {};

  for (const file of files) {
    if (!file.endsWith(".json") || file === "default.json" || file.startsWith("CDP-")) continue;
    
    try {
      const raw = await fs.readFile(path.join(kanjiDir, file), "utf-8");
      const data = JSON.parse(raw);
      const kanji = data.id || file.replace(".json", "");
      
      let hanViet = "";
      if (Array.isArray(data.hanViet) && data.hanViet.length > 0) {
        hanViet = data.hanViet[0];
      } else if (data.amHanViet) {
        hanViet = data.amHanViet;
      }

      if (hanViet) {
        mapList[kanji] = hanViet;
      }
    } catch (err) {
      console.error("Error parsing", file, err);
    }
  }

  await fs.writeFile(outFile, JSON.stringify(mapList, null, 2), "utf-8");
  console.log("Created hanviet-map.json with", Object.keys(mapList).length, "entries");
}

main().catch(console.error);
