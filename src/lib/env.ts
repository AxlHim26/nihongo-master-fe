const truthyValues = new Set(["1", "true", "yes", "on"]);

const readBooleanEnv = (value?: string) => {
  if (!value) {
    return false;
  }
  return truthyValues.has(value.toLowerCase());
};

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

export const BYPASS_AUTH = (() => {
  const rawValue = process.env["NEXT_PUBLIC_BYPASS_AUTH"];
  if (rawValue !== undefined) {
    return readBooleanEnv(rawValue);
  }
  return process.env["NODE_ENV"] === "development";
})();
