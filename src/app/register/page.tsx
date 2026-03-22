import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import RegisterForm from "@/features/auth/components/register-form";
import { pickSearchParam, resolveRedirectTarget } from "@/features/auth/utils/redirect";
import { AUTH_SESSION_HINT_COOKIE } from "@/features/auth/utils/session-hint";

type RegisterPageProps = {
  searchParams: Promise<{
    redirect?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "MiraiGo | Tạo tài khoản",
  description: "Tạo tài khoản MiraiGo để bắt đầu hành trình học tập",
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { redirect: redirectQuery } = await searchParams;
  const redirectParam = pickSearchParam(redirectQuery);
  const cookieStore = await cookies();

  if (cookieStore.get(AUTH_SESSION_HINT_COOKIE)?.value === "1") {
    redirect(resolveRedirectTarget(redirectParam));
  }

  return <RegisterForm redirectParam={redirectParam} />;
}
