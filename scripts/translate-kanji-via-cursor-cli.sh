#!/usr/bin/env bash
#
# Chạy Cursor Agent CLI liên tục để dịch meaning (EN→VI) trong data/kanji/*.json
# Mỗi lần gọi agent xử lý 1 lô file, ghi danh sách đã xử lý vào data/kanji-processed.txt
#
# Yêu cầu:
#   1. Cài Cursor CLI: curl https://cursor.com/install -fsS | bash
#   2. Xác thực (chọn một):
#      - Chạy trong terminal: agent login
#      - Hoặc set API key: export CURSOR_API_KEY="your-key"
#        (Lấy key tại: https://cursor.com/settings hoặc Cursor app > Settings > Account)
#
# Chạy: cd nihongo-master-fe && bash scripts/translate-kanji-via-cursor-cli.sh
# Khuyến nghị: dùng auto (API) thay vì CLI: npm run translate:kanji:auto
#

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PROCESSED_FILE="data/kanji-processed.txt"
BATCH_SIZE="${CURSOR_KANJI_BATCH:-15}"
MAX_ROUNDS="${CURSOR_KANJI_MAX_ROUNDS:-500}"
# Model: mặc định "auto" (= /model auto trong Cursor, nhẹ). Override: CURSOR_KANJI_MODEL=opus-4.5
AGENT_MODEL="${CURSOR_KANJI_MODEL:-auto}"

AGENT_CMD=""
if command -v agent &>/dev/null; then
  AGENT_CMD="agent"
elif command -v cursor &>/dev/null; then
  AGENT_CMD="cursor agent"
else
  echo "Cursor CLI chưa cài. Chạy: curl https://cursor.com/install -fsS | bash"
  echo "Rồi mở terminal mới và chạy lại script này."
  exit 1
fi

touch "$PROCESSED_FILE"

PROMPT="Trong thư mục data/kanji/ có rất nhiều file .json. Nhiệm vụ:

1. Đọc file data/kanji-processed.txt (mỗi dòng là tên file đã xử lý, ví dụ: 一.json).
2. Liệt kê tất cả file .json trong data/kanji/ (chỉ tên file).
3. Chọn đúng $BATCH_SIZE file CHƯA có trong kanji-processed.txt (ưu tiên file tên 1 ký tự hoặc tên ngắn trước).
4. Với mỗi file đã chọn:
   - Mở file JSON.
   - Mọi chỗ meaning là chuỗi tiếng Anh: thay bằng bản dịch tiếng Việt.
   - Mọi chỗ meaning là object có \"english\": \"...\": thêm field \"vietnamese\": \"<dịch tiếng Việt>\", giữ nguyên english.
   - Ghi lại file.
5. Append tên $BATCH_SIZE file vừa xử lý vào cuối data/kanji-processed.txt (mỗi dòng một tên file).

Chỉ làm đúng $BATCH_SIZE file mỗi lần. Trả lời ngắn: Đã xử lý: [danh sách $BATCH_SIZE tên file]."

for ((i=1; i<=MAX_ROUNDS; i++)); do
  echo "=== Cursor CLI round $i/$MAX_ROUNDS (model: $AGENT_MODEL) ==="
  ROUND_OUTPUT="$($AGENT_CMD -p "$PROMPT" --output-format text --model "$AGENT_MODEL" 2>&1)"
  ROUND_EXIT=$?
  echo "--- Agent exit code: $ROUND_EXIT ---"
  [ -n "$ROUND_OUTPUT" ] && echo "$ROUND_OUTPUT" || echo "(không có output)"
  if [ "$ROUND_EXIT" -ne 0 ]; then
    if echo "$ROUND_OUTPUT" | grep -qi "Authentication required\|Please run 'agent login'"; then
      echo ""
      echo "=== Cursor CLI chưa xác thực ==="
      echo "Chọn một cách:"
      echo "  1. Chạy: agent login   (đăng nhập trong terminal)"
      echo "  2. Hoặc: export CURSOR_API_KEY=\"your-api-key\""
      echo "     (Lấy key: Cursor app > Settings > Account, hoặc https://cursor.com/settings)"
    fi
    echo "Lỗi hoặc dừng ở round $i."
    exit 1
  fi
  echo ""
  sleep 2
done

echo "Đã chạy đủ $MAX_ROUNDS rounds."
