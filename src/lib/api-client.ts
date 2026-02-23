import Axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios";

import { authStorage } from "@/features/auth/utils/auth-storage";
import { getBackendApiUrl } from "@/lib/env";
import { ApiError } from "@/lib/fetcher";

type ApiEnvelope<T> = {
  status: number;
  message: string;
  data: T;
  errorCode?: string;
  path?: string;
  timestamp?: string;
};

type AuthTokenPayload = {
  token: string;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const AUTH_PREFIX = "/api/v1/auth/";
const AUTH_REFRESH_PATH = "/api/v1/auth/refresh";

const isBrowser = () => typeof window !== "undefined";

const getErrorMessage = (error: AxiosError<ApiEnvelope<unknown>>) => {
  return error.response?.data?.message || error.message || "Request failed";
};

const redirectToLogin = () => {
  if (!isBrowser()) {
    return;
  }

  const currentPath = `${window.location.pathname}${window.location.search}`;
  const redirect = currentPath.startsWith("/") ? currentPath : "/courses";
  const search = new URLSearchParams({ redirect });
  window.location.href = `/login?${search.toString()}`;
};

const isAuthEndpoint = (url: string | undefined) => {
  if (!url) {
    return false;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      return new URL(url).pathname.startsWith(AUTH_PREFIX);
    } catch {
      return false;
    }
  }

  return url.startsWith(AUTH_PREFIX);
};

const authRequestInterceptor = (config: InternalAxiosRequestConfig) => {
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  config.headers.set("Accept", "application/json");

  const token = authStorage.getToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
};

const createApiError = (error: AxiosError<ApiEnvelope<unknown>>) => {
  return new ApiError(getErrorMessage(error), error.response?.status ?? 500);
};

const refreshClient = Axios.create({
  baseURL: getBackendApiUrl(),
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await refreshClient.post<ApiEnvelope<AuthTokenPayload>>(AUTH_REFRESH_PATH);
    const token = response.data?.data?.token ?? null;

    if (!token) {
      return null;
    }

    authStorage.setSession(token);
    return token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

export const ensureAccessToken = async () => {
  const existingToken = authStorage.getToken();
  if (existingToken) {
    return existingToken;
  }

  try {
    return await refreshAccessToken();
  } catch {
    return null;
  }
};

export const api = Axios.create({
  baseURL: getBackendApiUrl(),
  withCredentials: true,
});

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const status = error.response?.status;
    const config = error.config as RetryableRequestConfig | undefined;
    const shouldHandleUnauthorized =
      status === 401 && config && !config._retry && !isAuthEndpoint(config.url);

    if (!shouldHandleUnauthorized) {
      throw createApiError(error);
    }

    config._retry = true;

    try {
      const nextToken = await refreshAccessToken();
      if (!nextToken) {
        authStorage.clearSession();
        redirectToLogin();
        throw createApiError(error);
      }

      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.set("Authorization", `Bearer ${nextToken}`);
      return await api(config);
    } catch (refreshError) {
      authStorage.clearSession();
      redirectToLogin();

      if (Axios.isAxiosError(refreshError)) {
        throw createApiError(refreshError as AxiosError<ApiEnvelope<unknown>>);
      }
      throw createApiError(error);
    }
  },
);
