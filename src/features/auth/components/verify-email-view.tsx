"use client";

import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LinkOffRoundedIcon from "@mui/icons-material/LinkOffRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import AuthStatusShell from "@/features/auth/components/auth-status-shell";
import {
  confirmEmailVerification,
  resendEmailVerification,
} from "@/features/auth/services/auth-api";
import { authStorage } from "@/features/auth/utils/auth-storage";
import {
  clearPendingVerification,
  resolvePendingVerificationRedirect,
} from "@/features/auth/utils/pending-verification";
import { createAuthRoute, createAuthRouteWithParams } from "@/features/auth/utils/redirect";
import { ApiError } from "@/lib/fetcher";

type VerificationViewState = "pending" | "success" | "expired" | "invalid" | "already-verified";

type VerifyEmailViewProps = {
  token: string | null;
  email?: string | null;
};

export default function VerifyEmailView({ token, email = null }: VerifyEmailViewProps) {
  const router = useRouter();
  const preservedRedirect = resolvePendingVerificationRedirect(email, "");
  const redirectParam = preservedRedirect || null;
  const hasSubmittedRef = React.useRef(false);
  const [viewState, setViewState] = React.useState<VerificationViewState>("pending");
  const [statusMessage, setStatusMessage] = React.useState(
    "MiraiGo đang kiểm tra link xác nhận của bạn.",
  );

  const confirmMutation = useMutation({
    mutationFn: confirmEmailVerification,
    onSuccess: (data) => {
      const targetPath = resolvePendingVerificationRedirect(email, "/courses");
      authStorage.setSession(data.token);
      clearPendingVerification(email);
      setViewState("success");
      setStatusMessage(
        "Tài khoản đã được kích hoạt. Bạn sẽ được đưa vào không gian học ngay bây giờ.",
      );
      window.setTimeout(() => {
        router.replace(targetPath);
      }, 900);
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) {
        setViewState("invalid");
        setStatusMessage("Không thể xác nhận tài khoản lúc này.");
        return;
      }

      if (error.status === 410) {
        setViewState("expired");
        setStatusMessage("Link xác nhận này đã hết hạn. Bạn có thể yêu cầu một link mới.");
        return;
      }

      if (error.status === 409) {
        setViewState("already-verified");
        setStatusMessage("Tài khoản này đã được xác nhận từ trước. Bạn có thể đăng nhập ngay.");
        return;
      }

      setViewState("invalid");
      setStatusMessage(error.message || "Link xác nhận không hợp lệ.");
    },
  });

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

  React.useEffect(() => {
    if (!token) {
      setViewState("invalid");
      setStatusMessage("Link xác nhận không hợp lệ hoặc đã bị thiếu thông tin.");
      return;
    }

    if (hasSubmittedRef.current) {
      return;
    }

    hasSubmittedRef.current = true;
    confirmMutation.mutate({ token });
  }, [confirmMutation, token]);

  const resendError =
    resendMutation.error instanceof ApiError
      ? resendMutation.error.message
      : "Không thể gửi lại email xác nhận lúc này.";

  const renderContent = () => {
    if (viewState === "pending") {
      return (
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CircularProgress size={24} />
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Đang xác nhận tài khoản...
            </Typography>
          </Stack>
        </Stack>
      );
    }

    if (viewState === "success") {
      return (
        <Alert severity="success">
          Tài khoản đã sẵn sàng. MiraiGo đang chuyển bạn đến không gian học tập.
        </Alert>
      );
    }

    if (viewState === "expired") {
      return (
        <Stack spacing={2.5}>
          <Alert severity="warning">{statusMessage}</Alert>
          {email ? (
            <Button
              type="button"
              variant="contained"
              size="large"
              startIcon={<AutorenewRoundedIcon />}
              disabled={resendMutation.isPending}
              onClick={() => resendMutation.mutate({ email })}
              sx={{
                borderRadius: "14px",
                py: { xs: 1.15, sm: 1.35 },
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {resendMutation.isPending ? "Đang gửi lại email..." : "Gửi lại email xác nhận"}
            </Button>
          ) : null}
          {resendMutation.isError ? <Alert severity="error">{resendError}</Alert> : null}
          <Typography variant="caption" sx={{ textAlign: "center", color: "text.secondary" }}>
            <Link
              href={createAuthRoute("/register", redirectParam)}
              style={{ color: "#2563EB", fontWeight: 700, textDecoration: "none" }}
            >
              Quay lại đăng ký
            </Link>
          </Typography>
        </Stack>
      );
    }

    if (viewState === "already-verified") {
      return (
        <Stack spacing={2.5}>
          <Alert severity="info">{statusMessage}</Alert>
          <Button
            component={Link}
            href={createAuthRoute("/login", redirectParam)}
            type="button"
            variant="contained"
            size="large"
            sx={{
              borderRadius: "14px",
              py: { xs: 1.15, sm: 1.35 },
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Đi đến đăng nhập
          </Button>
        </Stack>
      );
    }

    return (
      <Stack spacing={2.5}>
        <Alert severity="error">{statusMessage}</Alert>
        <Typography variant="caption" sx={{ textAlign: "center", color: "text.secondary" }}>
          <Link
            href={createAuthRoute("/register", redirectParam)}
            style={{ color: "#2563EB", fontWeight: 700, textDecoration: "none" }}
          >
            Tạo lại tài khoản
          </Link>
        </Typography>
      </Stack>
    );
  };

  const shellIcon =
    viewState === "success" ? (
      <CheckCircleRoundedIcon sx={{ fontSize: 36 }} />
    ) : viewState === "expired" ? (
      <ScheduleRoundedIcon sx={{ fontSize: 36 }} />
    ) : viewState === "already-verified" ? (
      <AlternateEmailRoundedIcon sx={{ fontSize: 36 }} />
    ) : viewState === "invalid" ? (
      <LinkOffRoundedIcon sx={{ fontSize: 36 }} />
    ) : (
      <CircularProgress size={30} color="inherit" />
    );

  const shellTitle =
    viewState === "success"
      ? "Tài khoản đã được xác nhận"
      : viewState === "expired"
        ? "Link xác nhận đã hết hạn"
        : viewState === "already-verified"
          ? "Tài khoản đã xác nhận rồi"
          : viewState === "invalid"
            ? "Không thể xác nhận link này"
            : "Đang xác nhận tài khoản";

  return (
    <AuthStatusShell
      badge="VERIFY EMAIL"
      title={shellTitle}
      description={statusMessage}
      icon={shellIcon}
      asideTitle="Liên kết một lần, đăng nhập tự động"
      asideDescription="Sau khi link hợp lệ, MiraiGo sẽ kích hoạt tài khoản, tạo phiên đăng nhập và đưa bạn vào app mà không cần thao tác thêm."
    >
      {renderContent()}
    </AuthStatusShell>
  );
}
