import type { Metadata } from "next";

import VerifyEmailView from "@/features/auth/components/verify-email-view";
import { pickSearchParam } from "@/features/auth/utils/redirect";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    token?: string | string[];
    email?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "MiraiGo | Kích hoạt tài khoản",
  description: "Xác nhận email và kích hoạt tài khoản MiraiGo",
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;

  return (
    <VerifyEmailView token={pickSearchParam(params.token)} email={pickSearchParam(params.email)} />
  );
}
