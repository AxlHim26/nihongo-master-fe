export const AUTH_SESSION_HINT_COOKIE = "miraigo_session_hint";

const AUTH_SESSION_HINT_VALUE = "1";
const AUTH_SESSION_HINT_MAX_AGE = 60 * 60 * 24 * 7;

const buildCookie = (maxAge: number) => {
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";

  return [
    `${AUTH_SESSION_HINT_COOKIE}=${AUTH_SESSION_HINT_VALUE}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "SameSite=Lax",
    isSecure ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ");
};

export const setAuthSessionHint = () => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = buildCookie(AUTH_SESSION_HINT_MAX_AGE);
};

export const clearAuthSessionHint = () => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = [`${AUTH_SESSION_HINT_COOKIE}=`, "Path=/", "Max-Age=0", "SameSite=Lax"].join(
    "; ",
  );
};
