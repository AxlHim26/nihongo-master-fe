import CheckIcon from "@mui/icons-material/Check";
import StarIcon from "@mui/icons-material/Star";
import { Button } from "@mui/material";

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-slate-50 py-24 dark:bg-slate-950">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">
            Bảng giá
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Đầu tư cho tương lai của bạn
          </p>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Chọn gói học phù hợp với mục tiêu chinh phục tiếng Nhật của bạn. Không phát sinh chi phí
            ẩn.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 items-center gap-8 md:grid-cols-2">
          {/* Free Tier */}
          <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Gói Cơ Bản</h3>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Miễn phí
              </span>
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Trải nghiệm nền tảng với các tính năng cơ bản, lý tưởng để bắt đầu.
            </p>
            <ul className="mt-8 flex-1 space-y-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {[
                "Học bảng chữ cái Hiragana & Katakana",
                "Truy cập từ điển cơ bản",
                "Học 50 Kanji N5",
                "Flashcard giới hạn 30 thẻ/ngày",
              ].map((feature, i) => (
                <li key={i} className="flex gap-x-3">
                  <CheckIcon
                    className="h-6 w-5 flex-none text-blue-600 dark:text-blue-400"
                    fontSize="small"
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              href="/login"
              variant="outlined"
              className="mt-8 w-full rounded-full border-blue-600 py-2.5 font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
            >
              Đăng ký miễn phí
            </Button>
          </div>

          {/* Pro Tier (Highlighted) */}
          <div className="relative z-10 transform rounded-3xl bg-gradient-to-b from-blue-600 to-indigo-700 p-8 text-white shadow-2xl ring-1 ring-blue-500/50 sm:p-10 md:scale-105">
            <div className="absolute right-6 top-0 -translate-y-1/2 transform">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase text-amber-900 shadow-sm">
                <StarIcon fontSize="inherit" /> Phổ biến nhất
              </span>
            </div>
            <h3 className="text-xl font-semibold text-blue-100">MiraiGo Pro</h3>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-4xl font-bold tracking-tight text-white">49.000đ</span>
              <span className="text-sm font-semibold leading-6 text-blue-200">/ tháng</span>
            </p>
            <p className="mt-4 text-sm leading-6 text-blue-100">
              Mở khoá toàn bộ sức mạnh của MiraiGo. Đỗ JLPT thật dễ dàng.
            </p>
            <ul className="mt-8 space-y-4 text-sm leading-6 text-blue-50">
              {[
                "Truy cập toàn bộ ngữ pháp N5-N1",
                "Mở khoá Kanji Map 3D",
                "Flashcard SRS không giới hạn",
                "Thi thử JLPT Mock Test",
                "Phân tích điểm yếu AI",
                "Không quảng cáo",
              ].map((feature, i) => (
                <li key={i} className="flex gap-x-3 font-medium">
                  <CheckIcon className="h-6 w-5 flex-none text-blue-300" fontSize="small" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              href="/login"
              variant="contained"
              className="mt-8 w-full rounded-full bg-white py-3 font-bold text-blue-700 shadow-md hover:bg-blue-50"
            >
              Nâng cấp Pro ngay
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
