"use client";

import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import AuthStatusShell from "@/features/auth/components/auth-status-shell";
import { resendEmailVerification } from "@/features/auth/services/auth-api";
import { createAuthRoute, createAuthRouteWithParams } from "@/features/auth/utils/redirect";
import { ApiError } from "@/lib/fetcher";

const RESEND_COOLDOWN_SECONDS = 45;

type CheckEmailViewProps = {
  email: string | null;
  redirectParam?: string | null;
  expires?: string | null;
  resent?: boolean;
};

export default function CheckEmailView({
  email,
  redirectParam = null,
  expires = null,
  resent = false,
}: CheckEmailViewProps) {
  const router = useRouter();
  const [cooldown, setCooldown] = React.useState(RESEND_COOLDOWN_SECONDS);

  React.useEffect(() => {
    if (!email) {
      router.replace(createAuthRoute("/register", redirectParam));
      return;
    }

    setCooldown(RESEND_COOLDOWN_SECONDS);
  }, [email, redirectParam, resent, router]);

  React.useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const resendMutation = useMutation({
    mutationFn: resendEmailVerification,
    onSuccess: (data) => {
      router.replace(
        createAuthRouteWithParams("/register/check-email", redirectParam, {
          email: data.email,
          expires: data.expiresInMinutes,
          resent: "1",
        }),
      );
    },
  });

  if (!email) {
    return null;
  }

  const loginHref = createAuthRoute("/login", redirectParam);
  const expiresLabel = expires ? `Link xác nhận có hiệu lực trong khoảng ${expires} phút.` : null;
  const resendDisabled = cooldown > 0 || resendMutation.isPending;
  const resendError =
    resendMutation.error instanceof ApiError
      ? resendMutation.error.message
      : "Không thể gửi lại email xác nhận lúc này.";

  return (
    <AuthStatusShell
      badge="CHECK EMAIL"
      title="Hãy truy cập email để xác nhận tài khoản"
      description="MiraiGo đã gửi một link xác nhận đến hộp thư của bạn. Sau khi bấm vào link, hệ thống sẽ kích hoạt tài khoản và tự động đăng nhập."
      icon={<AlternateEmailRoundedIcon sx={{ fontSize: 36 }} />}
      asideTitle="Xác nhận nhanh, vào học liền"
      asideDescription="Nếu không thấy email, hãy kiểm tra mục Spam hoặc Promotions. Bạn vẫn có thể gửi lại một link mới ngay trên màn hình này."
    >
      <Stack spacing={2.5}>
        <Stack spacing={1.5}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Email xác nhận đã được gửi tới
          </Typography>
          <Chip
            label={email}
            sx={{
              alignSelf: "flex-start",
              borderRadius: "999px",
              px: 0.75,
              fontWeight: 600,
            }}
          />
          {expiresLabel ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {expiresLabel}
            </Typography>
          ) : null}
        </Stack>

        {resent ? (
          <Alert severity="success">Đã gửi lại email xác nhận. Hãy kiểm tra hộp thư của bạn.</Alert>
        ) : null}
        {resendMutation.isError ? <Alert severity="error">{resendError}</Alert> : null}

        <Stack spacing={1.5}>
          <Button
            type="button"
            variant="contained"
            size="large"
            startIcon={<AutorenewRoundedIcon />}
            disabled={resendDisabled}
            onClick={() => resendMutation.mutate({ email })}
            sx={{
              borderRadius: "14px",
              py: { xs: 1.15, sm: 1.35 },
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {resendMutation.isPending
              ? "Đang gửi lại email..."
              : cooldown > 0
                ? `Gửi lại sau ${cooldown}s`
                : "Gửi lại email xác nhận"}
          </Button>

          <Typography variant="caption" sx={{ textAlign: "center", color: "text.secondary" }}>
            Đã xác nhận xong?{" "}
            <Link
              href={loginHref}
              style={{ color: "#2563EB", fontWeight: 700, textDecoration: "none" }}
            >
              Đăng nhập
            </Link>
          </Typography>
          <Typography variant="caption" sx={{ textAlign: "center", color: "text.secondary" }}>
            Muốn đổi email?{" "}
            <Link
              href={createAuthRoute("/register", redirectParam)}
              style={{ color: "#2563EB", fontWeight: 700, textDecoration: "none" }}
            >
              Tạo lại tài khoản
            </Link>
          </Typography>
        </Stack>
      </Stack>
    </AuthStatusShell>
  );
}
