"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { alpha, ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import * as React from "react";

import { createAppTheme } from "@/core/theme/create-theme";
import BrandLogo from "@/shared/components/ui/brand-logo";

type AuthStatusShellProps = {
  badge: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  asideTitle: string;
  asideDescription: string;
};

export default function AuthStatusShell({
  badge,
  title,
  description,
  icon,
  children,
  asideTitle,
  asideDescription,
}: AuthStatusShellProps) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)", {
    noSsr: true,
  });
  const isDarkMode = prefersDarkMode;
  const authTheme = React.useMemo(
    () => createAppTheme(isDarkMode ? "dark" : "light"),
    [isDarkMode],
  );

  return (
    <ThemeProvider theme={authTheme}>
      <Container
        disableGutters
        maxWidth={false}
        className="flex min-h-[100dvh] items-center justify-center px-3 py-3 sm:px-6 sm:py-8 lg:px-8"
        sx={{
          backgroundColor: "background.default",
          backgroundImage: isDarkMode
            ? `radial-gradient(circle at top, ${alpha("#60A5FA", 0.12)}, transparent 34%)`
            : "radial-gradient(circle at top, rgba(79, 131, 255, 0.08), transparent 36%)",
        }}
      >
        <Paper
          elevation={0}
          className="w-full max-w-5xl overflow-hidden rounded-[20px] sm:rounded-[28px]"
          sx={{
            backgroundColor: "background.paper",
            borderColor: "divider",
            boxShadow: isDarkMode
              ? "0 28px 60px -34px rgba(0, 0, 0, 0.72)"
              : "0 20px 60px -26px rgba(15, 23, 42, 0.35)",
          }}
        >
          <div className="grid grid-cols-1 lg:min-h-[620px] lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
            <Stack
              spacing={{ xs: 2.5, sm: 3.5 }}
              className="mx-auto w-full max-w-2xl justify-center px-5 py-6 sm:px-8 sm:py-10 lg:px-12"
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

              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "inline-flex",
                    width: 72,
                    height: 72,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "22px",
                    background: isDarkMode
                      ? `linear-gradient(160deg, ${alpha("#60A5FA", 0.24)} 0%, ${alpha("#1E293B", 0.8)} 100%)`
                      : "linear-gradient(160deg, rgba(79, 131, 255, 0.16) 0%, rgba(234, 241, 255, 0.92) 100%)",
                    color: isDarkMode ? "#BFDBFE" : "#2563EB",
                    border: `1px solid ${alpha(isDarkMode ? "#60A5FA" : "#4F83FF", 0.2)}`,
                  }}
                >
                  {icon}
                </Box>

                <Stack spacing={1.25}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: isDarkMode ? "#BFDBFE" : "#2563EB",
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                    }}
                  >
                    {badge}
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ color: "text.primary", fontSize: { xs: "1.7rem", sm: "2.25rem" } }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      maxWidth: 620,
                      fontSize: { xs: "0.98rem", sm: "1.02rem" },
                    }}
                  >
                    {description}
                  </Typography>
                </Stack>
              </Stack>

              {children}
            </Stack>

            <Stack
              className="relative hidden overflow-hidden border-l lg:flex"
              justifyContent="space-between"
              sx={{
                borderLeftColor: "divider",
                background: isDarkMode
                  ? `linear-gradient(160deg, ${authTheme.palette.background.paper} 0%, ${authTheme.palette.background.default} 54%, ${alpha("#60A5FA", 0.18)} 100%)`
                  : "linear-gradient(160deg, #EAF1FF 0%, #F8FAFC 54%, #DDE6F3 100%)",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: isDarkMode
                    ? `radial-gradient(circle at 18% 20%, ${alpha("#60A5FA", 0.16)} 0, transparent 26%), radial-gradient(circle at 76% 74%, ${alpha("#38BDF8", 0.1)} 0, transparent 28%)`
                    : "radial-gradient(circle at 18% 20%, rgba(79, 131, 255, 0.16) 0, transparent 28%), radial-gradient(circle at 76% 74%, rgba(96, 165, 250, 0.12) 0, transparent 30%)",
                }}
              />
              <Stack spacing={3} className="relative px-10 py-12">
                <Typography
                  variant="overline"
                  sx={{
                    color: isDarkMode ? "#BFDBFE" : "#2563EB",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                  }}
                >
                  ACCOUNT FLOW
                </Typography>
                <Stack spacing={1.5}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: "text.primary" }}>
                    {asideTitle}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 320 }}>
                    {asideDescription}
                  </Typography>
                </Stack>
              </Stack>

              <Stack spacing={2} className="relative px-10 pb-12">
                {["Đăng ký tài khoản", "Mở email xác nhận", "Bắt đầu học ngay"].map(
                  (item, index) => (
                    <Box
                      key={item}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderRadius: "18px",
                        border: `1px solid ${alpha(isDarkMode ? "#94A3B8" : "#94A3B8", 0.18)}`,
                        backgroundColor: alpha(
                          isDarkMode ? "#0F172A" : "#FFFFFF",
                          isDarkMode ? 0.44 : 0.72,
                        ),
                        px: 2.5,
                        py: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "999px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: alpha(isDarkMode ? "#60A5FA" : "#4F83FF", 0.16),
                          color: isDarkMode ? "#BFDBFE" : "#2563EB",
                          fontWeight: 700,
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                        {item}
                      </Typography>
                    </Box>
                  ),
                )}
              </Stack>
            </Stack>
          </div>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
