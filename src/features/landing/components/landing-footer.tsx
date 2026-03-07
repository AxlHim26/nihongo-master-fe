import Link from "next/link";

import BrandLogo from "@/shared/components/ui/brand-logo";

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white pb-8 pt-16 dark:border-slate-800 dark:bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <BrandLogo size="md" className="mb-4" />
            <p className="mt-4 max-w-xs text-slate-500 dark:text-slate-400">
              Biến tiếng Nhật trở thành siêu năng lực của bạn. Hệ thống học tập thông minh và hiệu
              quả dành cho người Việt.
            </p>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Sản phẩm</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/courses"
                  className="text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Tính năng
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Các khoá học JLPT
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  JLPT Mock Tests
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Công ty</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Điều khoản
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Bảo mật
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 dark:border-slate-800 md:flex-row">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} MiraiGo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
