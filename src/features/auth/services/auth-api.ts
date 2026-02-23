import { api } from "@/lib/api-client";

type ApiEnvelope<T> = {
  status: number;
  message: string;
  data: T;
  errorCode?: string;
  path?: string;
  timestamp?: string;
};

type AuthenticatePayload = {
  username: string;
  password: string;
};

type AuthenticateData = {
  token: string;
};

export type CurrentUser = {
  id: number;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
};

export const authenticate = async ({ username, password }: AuthenticatePayload) => {
  const response = await api.post<ApiEnvelope<AuthenticateData>>("/api/v1/auth/authenticate", {
    username,
    password,
  });

  return response.data.data;
};

export const getCurrentUser = async () => {
  const response = await api.get<ApiEnvelope<CurrentUser>>("/api/v1/users/me");
  return response.data.data;
};

export const logout = async () => {
  await api.post<ApiEnvelope<null>>("/api/v1/auth/logout");
};
