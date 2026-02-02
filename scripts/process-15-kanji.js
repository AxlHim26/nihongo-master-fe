const fs = require("fs");
const path = require("path");

const processedPath = path.join(__dirname, "../data/kanji-processed.txt");
const kanjiDir = path.join(__dirname, "../data/kanji");

const processed = new Set(
  fs
    .readFileSync(processedPath, "utf8")
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean),
);

const all = fs.readdirSync(kanjiDir).filter((f) => f.endsWith(".json"));
const unprocessed = all.filter((f) => !processed.has(f));
// Ưu tiên tên ngắn: sắp xếp theo độ dài tên file (ký tự)
unprocessed.sort((a, b) => a.length - b.length);
const selected = unprocessed.slice(0, 15);

console.log("Selected 15 files:", selected.join(", "));

// Bản dịch EN -> VI (bổ sung khi gặp chuỗi mới)
const translations = {};

function translateToVietnamese(english) {
  if (!english || typeof english !== "string") return english;
  const key = english.trim().toLowerCase();
  if (translations[key]) return translations[key];
  // Một số từ thường gặp - sẽ cập nhật khi đọc file
  const common = {
    one: "một",
    two: "hai",
    three: "ba",
    four: "bốn",
    five: "năm",
    six: "sáu",
    seven: "bảy",
    eight: "tám",
    nine: "chín",
    ten: "mười",
    street: "đường phố",
    ward: "phường",
    block: "khu",
    number: "số",
    counter: "đơn vị đếm",
    miscellaneous: "linh tinh",
    even: "chẵn",
    odd: "lẻ",
  };
  return common[key] || english; // fallback: giữ nguyên nếu chưa có
}

function processValue(val, key) {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) {
    return val.map((item) => processValue(item, key));
  }
  if (typeof val === "object") {
    const out = {};
    for (const k of Object.keys(val)) {
      out[k] = processValue(val[k], k);
    }
    if (typeof val.english === "string" && !val.vietnamese) {
      out.vietnamese = translateToVietnamese(val.english);
    }
    return out;
  }
  if (key === "meaning" && typeof val === "string") {
    // Chỉ thay nếu có vẻ là tiếng Anh (chữ Latin, không dấu)
    if (/^[a-zA-Z\s,\-']+$/.test(val) && val.length > 1) {
      return translateToVietnamese(val);
    }
  }
  return val;
}

// Chỉ in ra 15 file để xử lý thủ công
console.log("--- 15 files to process ---");
selected.forEach((f) => console.log(f));
process.exit(0);

selected.forEach((filename) => {
  const filepath = path.join(kanjiDir, filename);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filepath, "utf8"));
  } catch (e) {
    console.error("Read error", filename, e.message);
    return;
  }
  const processedData = processValue(data, "");
  fs.writeFileSync(filepath, JSON.stringify(processedData, null, 2), "utf8");
  console.log("Processed:", filename);
});

// Append to kanji-processed.txt
const toAppend = selected.join("\n") + "\n";
fs.appendFileSync(processedPath, toAppend, "utf8");
console.log("Appended 15 filenames to kanji-processed.txt");
