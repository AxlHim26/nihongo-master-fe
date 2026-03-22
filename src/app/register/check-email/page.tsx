import type { Metadata } from "next";

import CheckEmailView from "@/features/auth/components/check-email-view";
import { pickSearchParam } from "@/features/auth/utils/redirect";

type CheckEmailPageProps = {
  searchParams: Promise<{
    email?: string | string[];
    redirect?: string | string[];
    expires?: string | string[];
    resent?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "MiraiGo | Xác nhận email",
  description: "Kiểm tra email để xác nhận tài khoản MiraiGo",
};

export default async function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
  const params = await searchParams;

  return (
    <CheckEmailView
      email={pickSearchParam(params.email)}
      redirectParam={pickSearchParam(params.redirect)}
      expires={pickSearchParam(params.expires)}
      resent={pickSearchParam(params.resent) === "1"}
    />
  );
}
