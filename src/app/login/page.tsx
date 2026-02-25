import type { Metadata } from "next";
import { Suspense } from "react";

import LoginForm from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "MiraiGo | Đăng nhập",
  description: "Đăng nhập vào không gian học tập MiraiGo",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
          Đang tải đăng nhập...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
