"use client";

import LoginIcon from "@mui/icons-material/Login";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { ThemeProvider } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { createAppTheme } from "@/core/theme/create-theme";
import { authenticate } from "@/features/auth/services/auth-api";
import { authStorage } from "@/features/auth/utils/auth-storage";
import { ensureAccessToken } from "@/lib/api-client";
import { ApiError } from "@/lib/fetcher";
import BrandLogo from "@/shared/components/ui/brand-logo";

const isSafeRedirect = (value: string | null) => {
  if (!value) {
    return false;
  }
  return value.startsWith("/") && !value.startsWith("//");
};

const loginTheme = createAppTheme("light");

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const targetPath = isSafeRedirect(searchParams.get("redirect"))
    ? (searchParams.get("redirect") as string)
    : "/courses";

  React.useEffect(() => {
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
    <ThemeProvider theme={loginTheme}>
      <Container
        maxWidth={false}
        className="flex min-h-screen items-center justify-center bg-[#F8FAFC] py-4 sm:py-8"
      >
        <Paper
          elevation={0}
          className="w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-26px_rgba(15,23,42,0.35)]"
        >
          <div className="grid min-h-[620px] grid-cols-1 lg:grid-cols-3">
            <Stack
              spacing={4}
              component="form"
              onSubmit={handleSubmit}
              className="w-full justify-center py-8 lg:col-span-2 lg:mx-auto lg:w-3/4"
            >
              <BrandLogo size="md" />

              <Stack spacing={1}>
                <Typography variant="h4" fontWeight={700} className="text-slate-900">
                  Đăng nhập
                </Typography>
                <Typography variant="body2" className="text-slate-500">
                  Đăng nhập để tiếp tục học tập với MiraiGo.
                </Typography>
              </Stack>

              {mutation.isError && <Alert severity="error">{helperMessage}</Alert>}

              <Stack spacing={2.25}>
                <TextField
                  required
                  label="Tên đăng nhập"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  autoFocus
                  fullWidth
                />
                <TextField
                  required
                  label="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="Hiển thị mật khẩu"
                          edge="end"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? (
                            <VisibilityOffRoundedIcon fontSize="small" />
                          ) : (
                            <VisibilityRoundedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={
                  mutation.isPending || username.trim().length === 0 || password.length === 0
                }
                startIcon={<LoginIcon />}
                sx={{
                  borderRadius: "14px",
                  py: 1.35,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  backgroundColor: "#4F83FF",
                  "&:hover": { backgroundColor: "#3D73F3" },
                }}
              >
                {mutation.isPending ? "Đang xác thực..." : "Đăng nhập"}
              </Button>

              <Typography variant="caption" className="text-center text-slate-500">
                Khi đăng nhập, bạn đồng ý với chính sách sử dụng MiraiGo.
              </Typography>
            </Stack>

            <div className="relative hidden overflow-hidden border-l border-slate-200 bg-[#EAF1FF] lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-[#EAF1FF] via-[#F8FAFC] to-[#DDE6F3]" />
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 960 1120"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <defs>
                  <pattern
                    id="miraigo-squiggle"
                    width="220"
                    height="220"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M-20 55 C 20 18, 74 18, 120 55 S 216 92, 252 55"
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                    <path
                      d="M-36 152 C 4 114, 70 116, 108 152 S 196 188, 236 152"
                      fill="none"
                      stroke="#4F83FF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.34"
                    />
                    <circle cx="36" cy="190" r="3.2" fill="#CBD5E1" />
                    <circle cx="188" cy="34" r="3.2" fill="#93C5FD" />
                  </pattern>
                </defs>
                <rect width="960" height="1120" fill="url(#miraigo-squiggle)" />
                <g strokeLinecap="round" fill="none">
                  <path
                    d="M70 190 C 196 90, 346 116, 470 200"
                    stroke="#4F83FF"
                    strokeWidth="3"
                    opacity="0.34"
                  />
                  <path
                    d="M508 286 C 620 236, 742 238, 856 292"
                    stroke="#94A3B8"
                    strokeWidth="3"
                    opacity="0.38"
                  />
                  <path
                    d="M146 592 C 268 514, 402 540, 526 616"
                    stroke="#64748B"
                    strokeWidth="2.4"
                    opacity="0.22"
                  />
                  <path
                    d="M422 900 C 564 822, 710 842, 860 922"
                    stroke="#4F83FF"
                    strokeWidth="2.8"
                    opacity="0.29"
                  />
                </g>
              </svg>

              <div className="relative h-full" />
            </div>
          </div>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
