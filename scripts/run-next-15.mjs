#!/usr/bin/env node
/**
 * Chạy: node scripts/run-next-15.mjs
 * - Đọc kanji-processed.txt, liệt kê .json trong data/kanji/
 * - Chọn 15 file chưa xử lý (ưu tiên tên ngắn)
 * - Gọi process-15-unprocessed-vi.mjs logic (dịch EN→VI, ghi file, append processed)
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(__dirname, "process-15-unprocessed-vi.mjs");
const child = spawn(process.execPath, [script], {
  stdio: "inherit",
  cwd: path.join(__dirname, ".."),
});
child.on("exit", (code) => process.exit(code ?? 0));
