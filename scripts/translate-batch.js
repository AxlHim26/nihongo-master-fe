const fs = require("fs");
const path = require("path");

// Translation dictionary for common meanings
const translations = {
  // Numbers
  three: "ba",
  3: "3",
  "3 people": "3 người",
  "3 o'clock": "3 giờ",
  "3 (flat objects)": "3 (vật phẳng)",
  March: "tháng 3",
  "3 days, 3rd day of the month": "3 ngày, ngày 3 trong tháng",
  "3 (pieces)": "3 (cái)",
  four: "bốn",
  4: "4",
  April: "tháng 4",
  square: "hình vuông",
  Shikoku: "Shikoku",
  "four seasons": "bốn mùa",
  "4 o'clock": "4 giờ",
  crossroads: "ngã tư",
  "4 (objects)": "4 (vật)",
  "4 days, 4th of the month": "4 ngày, ngày 4 trong tháng",
  "4 times": "4 lần",
  five: "năm",
  5: "5",
  May: "tháng 5",
  "5 hours": "5 giờ",
  "5th floor": "tầng 5",
  "5 people": "5 người",
  "5 (objects)": "5 (vật)",
  "5 days, 5th of the month": "5 ngày, ngày 5 trong tháng",
  six: "sáu",
  6: "6",
  "6 o'clock": "6 giờ",
  "6 years old": "6 tuổi",
  "6th": "thứ 6",
  June: "tháng 6",
  "6 (long cylindrical objects)": "6 (vật dài hình trụ)",
  600: "600",
  "6 (pieces)": "6 (cái)",
  "6 days, 6th of the month": "6 ngày, ngày 6 trong tháng",
  ten: "mười",
  10: "10",
  "10 years": "10 năm",
  enough: "đủ",
  "10 months": "10 tháng",
  "10 (bound objects)": "10 (vật đóng bìa)",
  "10 (animals)": "10 (con vật)",
  "10 minutes": "10 phút",
  "10 (long cylindrical objects)": "10 (vật dài hình trụ)",
  "10 days, 10th of the month": "10 ngày, ngày 10 trong tháng",
  "several men, several minds": "mỗi người một ý",
  "20 years old": "20 tuổi",
  "20 days, 20th day of the month": "20 ngày, ngày 20 trong tháng",

  // Basic kanji
  mouth: "miệng",
  population: "dân số",
  clever: "thông minh",
  "tone of voice": "giọng điệu",
  "say something in unison": "nói đồng thanh",
  entrance: "lối vào",
  "exit [n.]": "lối ra",
  "service window (e.g. at bank)": "quầy dịch vụ (ví dụ: ở ngân hàng)",
  "slander, abuse": "nói xấu, lạm dụng",
  reticent: "ít nói",

  mountain: "núi",
  "Mt Fuji": "núi Phú Sĩ",
  "mountain range": "dãy núi",
  volcano: "núi lửa",
  "mountain-climbing": "leo núi",
  "mountain, pile, climax": "núi, đống, cao trào",
  "rocky mountain": "núi đá",
  bushfire: "cháy rừng",

  river: "sông",
  rivers: "các con sông",
  "upper reaches of a river": "thượng nguồn sông",
  downstream: "hạ lưu",
  "Edo River": "sông Edo",
  "small stream, brook": "suối nhỏ",

  "rice field": "ruộng lúa",
  "rural area": "vùng nông thôn",
  "rice planting": "cấy lúa",
  "Matsuda (surname)": "Matsuda (họ)",

  fire: "lửa",
  "thermal power": "nhiệt điện",
  Tuesday: "thứ Ba",
  "flame, fire": "ngọn lửa, lửa",
  fireworks: "pháo hoa",

  water: "nước",
  Wednesday: "thứ Tư",
  "water supply": "cấp nước",
  "level, standard": "mức độ, tiêu chuẩn",
  underwater: "dưới nước",
  "ocean water": "nước biển",
  "bathing suit": "đồ bơi",
  "light blue": "xanh nhạt",

  "tree, wood": "cây, gỗ",
  tree: "cây",
  wood: "gỗ",
  "large tree": "cây lớn",
  Thursday: "thứ Năm",
  lumber: "gỗ xẻ",
  wooden: "bằng gỗ",
  "Kimura (surname)": "Kimura (họ)",
  "Aoki (surname)": "Aoki (họ)",
  "garden shrubs": "cây bụi trong vườn",
  "foliage, leaf": "tán lá, lá",

  "metal, gold, money": "kim loại, vàng, tiền",
  metal: "kim loại",
  gold: "vàng",
  money: "tiền",
  Friday: "thứ Sáu",
  "blond hair": "tóc vàng",
  goldfish: "cá vàng",
  "amount of money": "số tiền",
  scholarship: "học bổng",
  "a fine": "tiền phạt",
  cash: "tiền mặt",
  "deposit in a bank": "gửi tiền ngân hàng",
  "gold colored": "màu vàng",
  hardware: "đồ kim loại",
  "metal, gold, mineral": "kim loại, vàng, khoáng sản",

  "soil, earth, ground": "đất",
  soil: "đất",
  earth: "đất, trái đất",
  ground: "mặt đất",
  Saturday: "thứ Bảy",
  "Saturday and Sunday": "thứ Bảy và Chủ nhật",
  "birth place": "quê hương",
  "plot of land": "mảnh đất",
  "earth colored": "màu đất",
  "local product, souvenir": "đặc sản, quà lưu niệm",

  "moon, month": "trăng, tháng",
  moon: "trăng",
  month: "tháng",
  "next month": "tháng sau",
  Monday: "thứ Hai",
  "last month": "tháng trước",
  "this month": "tháng này",
  "full moon": "trăng tròn",
  "New Year": "Năm mới",
  "birth date": "ngày sinh",
  "moon viewing": "ngắm trăng",
  "every month": "hàng tháng",
  "moon, month, period": "trăng, tháng, kỳ",

  // Radical meanings
  "one, horizontal stroke": "một, nét ngang",
  two: "hai",
  eight: "tám",
  "border, territorial boundaries": "biên giới, ranh giới lãnh thổ",
  "rice paddy": "ruộng lúa",
};

function translateMeaning(meaning) {
  if (typeof meaning === "string") {
    return translations[meaning] || meaning;
  }
  if (typeof meaning === "object" && meaning !== null) {
    if (meaning.english && !meaning.vietnamese) {
      meaning.vietnamese = translations[meaning.english] || meaning.english;
    }
    return meaning;
  }
  return meaning;
}

function processObject(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => processObject(item));
  }

  const result = {};
  for (const key of Object.keys(obj)) {
    if (key === "meaning") {
      result[key] = translateMeaning(obj[key]);
    } else if (key === "rad_meaning") {
      result[key] = translations[obj[key]] || obj[key];
    } else {
      result[key] = processObject(obj[key]);
    }
  }
  return result;
}

const filesToProcess = [
  "三.json",
  "四.json",
  "五.json",
  "六.json",
  "十.json",
  "口.json",
  "山.json",
  "川.json",
  "田.json",
  "火.json",
  "水.json",
  "木.json",
  "金.json",
  "土.json",
  "月.json",
];

const kanjiDir = path.join(__dirname, "..", "data", "kanji");

for (const file of filesToProcess) {
  const filePath = path.join(kanjiDir, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const processed = processObject(data);
    fs.writeFileSync(filePath, JSON.stringify(processed, null, 2));
    console.log(`Processed: ${file}`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
}

console.log("Done!");
