import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Button } from "@mui/material";
import Link from "next/link";

import InteractiveKanjiCard from "@/features/landing/components/interactive-kanji-card";
import KanjiRain from "@/features/landing/components/kanji-rain";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-slate-50 pb-32 pt-24 dark:bg-[#020617] sm:pb-40 sm:pt-32">
      {/* Kanji Rain Background Animation */}
      <KanjiRain />

      {/* Dynamic Background decor */}
      <div
        className="absolute left-1/2 top-1/2 -z-10 h-full w-full max-w-7xl -translate-x-1/2 -translate-y-1/2 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] animate-pulse-slow rounded-full bg-blue-500/20 mix-blend-multiply blur-3xl filter"></div>
        <div
          className="absolute right-1/4 top-1/3 h-[500px] w-[500px] animate-pulse-slow rounded-full bg-indigo-500/20 mix-blend-multiply blur-3xl filter"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-purple-500/10 mix-blend-multiply blur-3xl filter"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left Text Column */}
          <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
            <div className="mb-8 flex justify-center lg:justify-start">
              <div className="relative flex cursor-pointer items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm leading-6 text-slate-700 shadow-sm ring-1 ring-slate-900/10 backdrop-blur-md transition-all hover:ring-slate-900/20 dark:bg-slate-900/70 dark:text-slate-300 dark:ring-white/10 dark:hover:ring-white/20">
                <AutoAwesomeIcon fontSize="small" className="text-blue-600 dark:text-blue-400" />
                <span className="font-medium">Nền tảng học tiếng Nhật thế hệ mới</span>
              </div>
            </div>

            <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-7xl">
              Chinh phục <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                tiếng Nhật
              </span>
              <br /> dễ dàng hơn
            </h1>

            <p className="mx-auto mb-10 mt-6 max-w-xl text-xl leading-8 text-slate-600 dark:text-slate-300 lg:mx-0">
              Biến việc học tiếng Nhật trở thành siêu năng lực. Hệ thống cá nhân hoá, Kanji 3D và
              thuật toán SRS thông minh.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link href="/courses" passHref legacyBehavior>
                <Button
                  variant="contained"
                  size="large"
                  className="w-full rounded-full bg-slate-900 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-slate-900/20 transition-transform hover:scale-105 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:shadow-white/10 dark:hover:bg-slate-100 sm:w-auto"
                  endIcon={<ArrowForwardIcon />}
                >
                  Bắt đầu học ngay
                </Button>
              </Link>
              <Link href="#features" passHref legacyBehavior>
                <Button
                  variant="outlined"
                  size="large"
                  className="w-full rounded-full border-slate-300 px-8 py-4 text-base font-medium text-slate-700 transition-all hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
                >
                  Hiểu cách hoạt động
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Visual Column - Interactive Card */}
          <div className="perspective-1000 relative hidden items-center justify-center lg:flex">
            <InteractiveKanjiCard />
          </div>
        </div>
      </div>
    </section>
  );
}
