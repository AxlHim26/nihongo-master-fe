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

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

type ResendVerificationPayload = {
  email: string;
};

type ConfirmVerificationPayload = {
  token: string;
};

type AuthenticateData = {
  token: string;
};

export type EmailVerificationStatus = {
  email: string;
  expiresInMinutes: number;
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

export const registerAccount = async ({ username, email, password }: RegisterPayload) => {
  const response = await api.post<ApiEnvelope<EmailVerificationStatus>>("/api/v1/auth/register", {
    username,
    email,
    password,
  });

  return response.data.data;
};

export const resendEmailVerification = async ({ email }: ResendVerificationPayload) => {
  const response = await api.post<ApiEnvelope<EmailVerificationStatus>>(
    "/api/v1/auth/verification/resend",
    {
      email,
    },
  );

  return response.data.data;
};

export const confirmEmailVerification = async ({ token }: ConfirmVerificationPayload) => {
  const response = await api.post<ApiEnvelope<AuthenticateData>>(
    "/api/v1/auth/verification/confirm",
    {
      token,
    },
  );

  return response.data.data;
};

export const getCurrentUser = async () => {
  const response = await api.get<ApiEnvelope<CurrentUser>>("/api/v1/users/me");
  return response.data.data;
};

export const logout = async () => {
  await api.post<ApiEnvelope<null>>("/api/v1/auth/logout");
};
