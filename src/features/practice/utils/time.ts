export const formatTime = (date: Date = new Date()) =>
  date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
