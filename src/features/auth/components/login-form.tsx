"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoginIcon from "@mui/icons-material/Login";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { authenticate } from "@/features/auth/services/auth-api";
import { authStorage } from "@/features/auth/utils/auth-storage";
import { ensureAccessToken } from "@/lib/api-client";
import { BYPASS_AUTH } from "@/lib/env";
import { ApiError } from "@/lib/fetcher";

const isSafeRedirect = (value: string | null) => {
  if (!value) {
    return false;
  }
  return value.startsWith("/") && !value.startsWith("//");
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const targetPath = isSafeRedirect(searchParams.get("redirect"))
    ? (searchParams.get("redirect") as string)
    : "/courses";

  React.useEffect(() => {
    if (BYPASS_AUTH) {
      router.replace(targetPath);
      return;
    }

    let alive = true;

    const bootstrapAuth = async () => {
      const token = authStorage.getToken() ?? (await ensureAccessToken());
      if (token && alive) {
        router.replace(targetPath);
      }
    };

    void bootstrapAuth();

    return () => {
      alive = false;
    };
  }, [router, targetPath]);

  const mutation = useMutation({
    mutationFn: authenticate,
    onSuccess: (data) => {
      authStorage.setSession(data.token);
      router.replace(targetPath);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({ username: username.trim(), password });
  };

  const helperMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";

  return (
    <Container maxWidth="sm" className="flex min-h-screen items-center justify-center py-8">
      <Paper
        elevation={0}
        className="w-full rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-8 shadow-sm"
      >
        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          <Stack spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main", width: 44, height: 44 }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5" fontWeight={700}>
              Đăng nhập
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Truy cập hệ thống học tập Nihongo Master
            </Typography>
          </Stack>

          {mutation.isError && <Alert severity="error">{helperMessage}</Alert>}

          <TextField
            required
            label="Tên đăng nhập"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            autoFocus
          />
          <TextField
            required
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={mutation.isPending || username.trim().length === 0 || password.length === 0}
            startIcon={<LoginIcon />}
          >
            {mutation.isPending ? "Đang xác thực..." : "Đăng nhập"}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
