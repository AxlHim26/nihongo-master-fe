import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";

import HeroSection from "@/features/landing/components/hero-section";
import LandingFooter from "@/features/landing/components/landing-footer";
import LandingHeader from "@/features/landing/components/landing-header";
import PricingSection from "@/features/landing/components/pricing-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 selection:bg-blue-500/30 dark:bg-[#020617]">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />

        {/* Features Bento Grid Section */}
        <section id="features" className="relative overflow-hidden py-32">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-20 max-w-3xl text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">
                Thiết kế cho người Việt
              </h2>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Tất cả công cụ bạn cần để đỗ JLPT
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
                Không còn cách học nhàm chán. MiraiGo sử dụng công nghệ để biến việc học ngữ pháp,
                từ vựng và Kanji trở nên trực quan.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid auto-rows-[320px] grid-cols-1 gap-6 md:grid-cols-3">
              {/* Feature 1 - Large spanning across 2 columns */}
              <div className="group relative col-span-1 overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/50">
                    <AutoStoriesOutlinedIcon className="text-2xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">
                    Ngữ pháp qua ngữ cảnh
                  </h3>
                  <p className="max-w-md text-lg text-slate-600 dark:text-slate-400">
                    Thay vì học thuộc quy tắc khô khan, bạn sẽ hiểu cấu trúc qua 10,000+ ví dụ tiếng
                    Việt - tiếng Nhật có phát âm tự nhiên.
                  </p>
                </div>
                {/* Decorative background element */}
                <div className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-slate-100 opacity-50 transition-transform duration-700 group-hover:scale-110 dark:bg-slate-800"></div>
              </div>

              {/* Feature 2 - Single column */}
              <div className="group relative col-span-1 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20 dark:border-slate-800">
                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                    <TimelineOutlinedIcon className="text-2xl text-white" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold">Thuật toán ghi nhớ</h3>
                  <p className="text-lg text-indigo-100">
                    Hệ thống Spaced Repetition (SRS) tự động tính toán thời điểm hoàn hảo để ôn tập.
                  </p>
                </div>
              </div>

              {/* Feature 3 - Single column */}
              <div className="group relative col-span-1 overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
                    <TranslateOutlinedIcon className="text-2xl text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">
                    Tra cứu thông minh
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Từ điển Nhật - Việt tích hợp sâu vào bài học. Chọn bất kỳ đoạn văn nào để tra
                    nghĩa nhanh.
                  </p>
                </div>
              </div>

              {/* Feature 4 - Large spanning across 2 columns */}
              <div className="group relative col-span-1 overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                <div className="relative z-10 flex h-full flex-col justify-center">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/40">
                    <LayersOutlinedIcon className="text-2xl text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">
                    Kanji Map Liên Kết 3D
                  </h3>
                  <p className="max-w-md text-lg text-slate-600 dark:text-slate-400">
                    Thay vì học đơn trị, khám phá mạng lưới hàng ngàn Hán tự liên kết qua bộ thủ và
                    ý nghĩa, giúp &quot;học 1 biết 10&quot;.
                  </p>
                </div>
                {/* Visual abstract node connection */}
                <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-1/2 opacity-20 transition-opacity group-hover:opacity-30 dark:opacity-40">
                  <svg
                    viewBox="0 0 100 100"
                    className="h-full w-full text-amber-500"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="80" cy="50" r="15" strokeWidth="2" />
                    <circle cx="20" cy="30" r="8" strokeWidth="1" />
                    <circle cx="40" cy="80" r="10" strokeWidth="1" />
                    <path d="M70 45 L25 32" strokeWidth="1" strokeDasharray="2 2" />
                    <path d="M72 58 L45 75" strokeWidth="1" strokeDasharray="2 2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PricingSection />
      </main>
      <LandingFooter />
    </div>
  );
}
