import type { Metadata } from "next";

import LoginForm from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập để truy cập hệ thống học tập",
};

export default function LoginPage() {
  return <LoginForm />;
}
