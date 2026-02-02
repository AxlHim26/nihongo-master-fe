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

export const authenticate = async ({ username, password }: AuthenticatePayload) => {
  const response = await api.post<ApiEnvelope<AuthenticateData>>("/api/v1/auth/authenticate", {
    username,
    password,
  });

  return response.data.data;
};
