import fs from "node:fs/promises";
import path from "node:path";
import wanakana from "wanakana";

const KANJI_DIR = process.env.KANJI_DATA_DIR || path.join(process.cwd(), "data", "kanji");

async function main() {
  const args = process.argv.slice(2);
  const skipTranslate = args.includes("--skip-translate");

  let files;
  try {
    files = (await fs.readdir(KANJI_DIR)).filter(f => f.endsWith(".json"));
  } catch (err) {
    console.error("Could not read directory", KANJI_DIR);
    return;
  }

  let processedCount = 0;

  for (const file of files) {
    const filePath = path.join(KANJI_DIR, file);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(content);

      let changed = false;

      const processExamples = (examples) => {
        if (!Array.isArray(examples)) return;
        for (const ex of examples) {
          // 1. Add Romaji
          if (!ex.romaji && ex.reading) {
            ex.romaji = wanakana.toRomaji(ex.reading);
            changed = true;
          }

          // 2. Prepare bilingual meaning format if not present
          // Since the user wants to use tool to supplement meaning later, we'll
          // construct the object. If it's English, we put it in "en". If Vietnamese, "vi".
          if (typeof ex.meaning === "string") {
            const str = ex.meaning.trim();
            if (str) {
              // Very simple heuristic to check if it's Japanese/Vietnamese vs English
              // If it contains vietnamese specific characters, it's VI. Else EN.
              const isVi = /[àáảãạăằắẳẵặpâầấẩẫậpèéẻẽẹêềếểễệpìíỉĩịòóỏõọôồốổỗộpơờớởỡợpùúủũụưừứửữựỳýỷỹỵđ]/i.test(str);
              ex.meaning = isVi ? { vi: str } : { en: str };
              changed = true;
            }
          }
        }
      };

      if (data.jishoData) {
        processExamples(data.jishoData.kunyomiExamples);
        processExamples(data.jishoData.onyomiExamples);
      }
      
      if (data.kanjialiveData?.examples) {
        processExamples(data.kanjialiveData.examples);
      }

      if (changed) {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
        processedCount++;
      }
      
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }

  console.log(`Processed ${processedCount} files and added romaji / restructured meanings.`);
}

main().catch(console.error);
