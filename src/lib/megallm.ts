const DEFAULT_MEGALLM_BASE_URL = "https://ai.megallm.io";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const trimV1Suffix = (value: string) => value.replace(/\/v1$/i, "");

export const buildMegaLlmChatCompletionsUrl = (rawBaseUrl?: string) => {
  const fallback =
    rawBaseUrl && rawBaseUrl.trim().length > 0 ? rawBaseUrl : DEFAULT_MEGALLM_BASE_URL;
  const normalizedBase = trimV1Suffix(trimTrailingSlash(fallback.trim()));
  return `${normalizedBase}/v1/chat/completions`;
};
