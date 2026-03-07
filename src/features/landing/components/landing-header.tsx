import LoginIcon from "@mui/icons-material/Login";
import MenuIcon from "@mui/icons-material/Menu";
import { Button } from "@mui/material";
import Link from "next/link";

import BrandLogo from "@/shared/components/ui/brand-logo";

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <BrandLogo size="md" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
            <Link
              href="#features"
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Tính năng
            </Link>
            <Link
              href="#courses"
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Khoá học
            </Link>
            <Link
              href="/practice/jlpt"
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Thi thử JLPT
            </Link>
            <Link
              href="#pricing"
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Bảng giá
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button
              variant="outlined"
              color="primary"
              className="hidden rounded-full border-blue-200 font-medium hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30 sm:flex"
              startIcon={<LoginIcon />}
            >
              Đăng nhập
            </Button>
          </Link>
          <Link href="/courses">
            <Button
              variant="contained"
              color="primary"
              className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 font-medium shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700"
            >
              Bắt đầu miễn phí
            </Button>
          </Link>
          {/* Mobile menu could go here */}
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden">
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
