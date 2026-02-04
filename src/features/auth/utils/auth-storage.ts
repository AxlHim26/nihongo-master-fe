let accessToken: string | null = null;
let username: string | null = null;
let email: string | null = null;
let role: string | null = null;

type JwtPayload = {
  sub?: string;
  email?: string;
  role?: string;
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");

  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return window.atob(padded);
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf-8");
  }

  return "";
};

const parseJwt = (token: string): JwtPayload | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }
    const decoded = decodeBase64Url(payload);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
};

export const authStorage = {
  getToken: () => accessToken,
  getUsername: () => username,
  getEmail: () => email,
  getRole: () => role,
  setToken: (token: string | null) => {
    accessToken = token;
  },
  setSession: (token: string) => {
    accessToken = token;
    const payload = parseJwt(token);
    username = payload?.sub ?? null;
    email = payload?.email ?? null;
    role = payload?.role ?? null;
  },
  clearSession: () => {
    accessToken = null;
    username = null;
    email = null;
    role = null;
  },
};
