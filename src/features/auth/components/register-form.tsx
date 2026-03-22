"use client";

import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { alpha, ThemeProvider } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { createAppTheme } from "@/core/theme/create-theme";
import { registerAccount } from "@/features/auth/services/auth-api";
import { savePendingVerification } from "@/features/auth/utils/pending-verification";
import { createAuthRoute, createAuthRouteWithParams } from "@/features/auth/utils/redirect";
import { ApiError } from "@/lib/fetcher";
import BrandLogo from "@/shared/components/ui/brand-logo";

type RegisterFormProps = {
  redirectParam?: string | null;
};

export default function RegisterForm({ redirectParam = null }: RegisterFormProps) {
  const router = useRouter();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)", {
    noSsr: true,
  });
  const isPhone = useMediaQuery("(max-width:599.95px)", {
    noSsr: true,
  });
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const isDarkMode = prefersDarkMode;
  const authTheme = React.useMemo(
    () => createAppTheme(isDarkMode ? "dark" : "light"),
    [isDarkMode],
  );

  const accentColor = isDarkMode ? "#6B8BFF" : "#4F83FF";
  const accentHover = isDarkMode ? "#88A7FF" : "#3D73F3";
  const desktopHeroBackground = isDarkMode
    ? `linear-gradient(160deg, ${authTheme.palette.background.paper} 0%, ${authTheme.palette.background.default} 54%, ${alpha("#60A5FA", 0.16)} 100%)`
    : "linear-gradient(135deg, #EAF1FF 0%, #F8FAFC 58%, #DDE6F3 100%)";
  const artColors = isDarkMode
    ? {
        softStroke: alpha("#94A3B8", 0.42),
        accentStroke: alpha("#60A5FA", 0.42),
        dotBase: "#334155",
        dotAccent: "#60A5FA",
        lineOne: alpha("#60A5FA", 0.46),
        lineTwo: alpha("#94A3B8", 0.42),
        lineThree: alpha("#64748B", 0.36),
        lineFour: alpha("#60A5FA", 0.38),
      }
    : {
        softStroke: "#94A3B8",
        accentStroke: "#4F83FF",
        dotBase: "#CBD5E1",
        dotAccent: "#93C5FD",
        lineOne: "#4F83FF",
        lineTwo: "#94A3B8",
        lineThree: "#64748B",
        lineFour: "#4F83FF",
      };

  const loginHref = createAuthRoute("/login", redirectParam);
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const mutation = useMutation({
    mutationFn: registerAccount,
    onSuccess: (data) => {
      savePendingVerification(data.email, redirectParam);
      router.replace(
        createAuthRouteWithParams("/register/check-email", redirectParam, {
          email: data.email,
          expires: data.expiresInMinutes,
        }),
      );
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passwordMismatch) {
      setFormError("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    setFormError(null);
    mutation.mutate({
      username: username.trim(),
      email: email.trim(),
      password,
    });
  };

  const helperMessage =
    formError ??
    (mutation.error instanceof ApiError
      ? mutation.error.message
      : "Tạo tài khoản thất bại. Vui lòng kiểm tra lại thông tin.");

  return (
    <ThemeProvider theme={authTheme}>
      <Container
        disableGutters
        maxWidth={false}
        className="flex h-[100dvh] items-start justify-center overflow-y-auto px-3 py-3 sm:h-auto sm:min-h-[100dvh] sm:items-center sm:overflow-visible sm:px-6 sm:py-8 lg:px-8"
        sx={{
          backgroundColor: "background.default",
          backgroundImage: isDarkMode
            ? `radial-gradient(circle at top, ${alpha("#60A5FA", 0.12)}, transparent 34%)`
            : "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Paper
          elevation={0}
          className="my-auto w-full max-w-5xl overflow-hidden rounded-[20px] sm:rounded-[28px]"
          sx={{
            backgroundColor: "background.paper",
            borderColor: "divider",
            boxShadow: isDarkMode
              ? "0 28px 60px -34px rgba(0, 0, 0, 0.72)"
              : "0 20px 60px -26px rgba(15, 23, 42, 0.35)",
          }}
        >
          <div className="grid grid-cols-1 lg:min-h-[680px] lg:grid-cols-3">
            <Stack
              spacing={{ xs: 2.5, sm: 4 }}
              component="form"
              onSubmit={handleSubmit}
              className="mx-auto w-full max-w-xl justify-center px-5 py-6 sm:px-8 sm:py-10 lg:col-span-2 lg:mx-auto lg:w-3/4 lg:max-w-none lg:px-0"
            >
              <BrandLogo
                size="md"
                primaryTextClassName={
                  isDarkMode ? "text-white dark:text-white" : "text-slate-900 dark:text-slate-900"
                }
                accentTextClassName={
                  isDarkMode
                    ? "text-[#60A5FA] dark:text-[#60A5FA]"
                    : "text-[#3D73F3] dark:text-[#3D73F3]"
                }
                subtitleClassName={
                  isDarkMode
                    ? "text-[#A1A1AA] dark:text-[#A1A1AA]"
                    : "text-slate-500 dark:text-slate-500"
                }
              />

              <Stack spacing={1}>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ color: "text.primary", fontSize: { xs: "1.65rem", sm: "2.125rem" } }}
                >
                  Tạo tài khoản
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Tạo tài khoản để bắt đầu học, lưu tiến độ và truy cập MiraiGo trên mọi thiết bị.
                </Typography>
              </Stack>

              {(formError || mutation.isError) && <Alert severity="error">{helperMessage}</Alert>}

              <Stack spacing={{ xs: 1.75, sm: 2.25 }}>
                <TextField
                  required
                  label="Tên đăng nhập"
                  value={username}
                  onChange={(event) => {
                    setFormError(null);
                    setUsername(event.target.value);
                  }}
                  autoComplete="username"
                  autoFocus
                  size={isPhone ? "small" : "medium"}
                  fullWidth
                  sx={{ "& .MuiInputBase-root": { minHeight: { xs: 48, sm: 56 } } }}
                />
                <TextField
                  required
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setFormError(null);
                    setEmail(event.target.value);
                  }}
                  autoComplete="email"
                  size={isPhone ? "small" : "medium"}
                  fullWidth
                  sx={{ "& .MuiInputBase-root": { minHeight: { xs: 48, sm: 56 } } }}
                />
                <TextField
                  required
                  label="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setFormError(null);
                    setPassword(event.target.value);
                  }}
                  autoComplete="new-password"
                  size={isPhone ? "small" : "medium"}
                  fullWidth
                  sx={{ "& .MuiInputBase-root": { minHeight: { xs: 48, sm: 56 } } }}
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
                <TextField
                  required
                  label="Xác nhận mật khẩu"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => {
                    setFormError(null);
                    setConfirmPassword(event.target.value);
                  }}
                  autoComplete="new-password"
                  error={passwordMismatch}
                  helperText={passwordMismatch ? "Mật khẩu xác nhận chưa khớp." : undefined}
                  size={isPhone ? "small" : "medium"}
                  fullWidth
                  sx={{ "& .MuiInputBase-root": { minHeight: { xs: 48, sm: 56 } } }}
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
                fullWidth
                disabled={
                  mutation.isPending ||
                  username.trim().length === 0 ||
                  email.trim().length === 0 ||
                  password.length === 0 ||
                  confirmPassword.length === 0 ||
                  passwordMismatch
                }
                sx={{
                  borderRadius: "14px",
                  py: { xs: 1.15, sm: 1.35 },
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: { xs: "0.92rem", sm: "0.95rem" },
                  backgroundColor: accentColor,
                  boxShadow: `0 18px 34px -22px ${alpha(accentColor, isDarkMode ? 0.58 : 0.42)}`,
                  "&:hover": {
                    backgroundColor: accentHover,
                    boxShadow: `0 22px 40px -24px ${alpha(accentColor, isDarkMode ? 0.64 : 0.48)}`,
                  },
                }}
              >
                {mutation.isPending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </Button>

              <Typography variant="caption" sx={{ textAlign: "center", color: "text.secondary" }}>
                Đã có tài khoản?{" "}
                <Link
                  href={loginHref}
                  style={{
                    color: isDarkMode ? "#BFDBFE" : "#2563EB",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Đăng nhập
                </Link>
              </Typography>
            </Stack>

            <div
              className="relative hidden overflow-hidden border-l lg:block"
              style={{
                borderLeftColor: authTheme.palette.divider,
                backgroundColor: isDarkMode ? authTheme.palette.background.paper : "#EAF1FF",
              }}
            >
              <div className="absolute inset-0" style={{ background: desktopHeroBackground }} />
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 960 1120"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <defs>
                  <pattern
                    id="miraigo-register-squiggle"
                    width="220"
                    height="220"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M-20 55 C 20 18, 74 18, 120 55 S 216 92, 252 55"
                      fill="none"
                      stroke={artColors.softStroke}
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                    <path
                      d="M-36 152 C 4 114, 70 116, 108 152 S 196 188, 236 152"
                      fill="none"
                      stroke={artColors.accentStroke}
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.34"
                    />
                    <circle cx="36" cy="190" r="3.2" fill={artColors.dotBase} />
                    <circle cx="188" cy="34" r="3.2" fill={artColors.dotAccent} />
                  </pattern>
                </defs>
                <rect width="960" height="1120" fill="url(#miraigo-register-squiggle)" />
                <g strokeLinecap="round" fill="none">
                  <path
                    d="M70 190 C 196 90, 346 116, 470 200"
                    stroke={artColors.lineOne}
                    strokeWidth="3"
                    opacity="0.34"
                  />
                  <path
                    d="M508 286 C 620 236, 742 238, 856 292"
                    stroke={artColors.lineTwo}
                    strokeWidth="3"
                    opacity="0.38"
                  />
                  <path
                    d="M146 592 C 268 514, 402 540, 526 616"
                    stroke={artColors.lineThree}
                    strokeWidth="2.4"
                    opacity="0.22"
                  />
                  <path
                    d="M422 900 C 564 822, 710 842, 860 922"
                    stroke={artColors.lineFour}
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
