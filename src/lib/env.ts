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
