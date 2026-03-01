export const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }

  return (
    process.env["NEXT_PUBLIC_API_BASE_URL"] ??
    process.env["NEXT_PUBLIC_APP_URL"] ??
    "http://localhost:3000"
  );
};

export const getBackendApiUrl = () =>
  process.env["NEXT_PUBLIC_BACKEND_API_URL"] ?? "http://localhost:8080";

export const getKanjiDataDir = () => process.env["KANJI_DATA_DIR"] ?? "data/kanji";
