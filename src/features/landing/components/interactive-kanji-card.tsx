"use client";

import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import React, { useState } from "react";

export default function InteractiveKanjiCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="perspective-1000 relative mx-auto w-full max-w-[320px]">
      {/* Glow effect behind the card */}
      <div className="absolute -inset-1 animate-pulse-slow rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-600 opacity-30 blur-2xl"></div>

      {/* Floating Card Container */}
      <div
        className={`relative w-full rounded-2xl border border-white/20 bg-white/60 p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all duration-700 ease-out dark:border-slate-700/50 dark:bg-slate-900/60 dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] ${isHovered ? "z-10 scale-105 shadow-blue-500/20" : "animate-float-card"}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transformStyle: "preserve-3d",
          transform: isHovered ? "translateY(-10px) rotateX(5deg) rotateY(-5deg)" : "",
        }}
      >
        {/* Top Header of Card */}
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            JLPT N5
          </span>
          <button className="text-slate-400 transition-colors hover:text-blue-500">
            <VolumeUpIcon fontSize="small" />
          </button>
        </div>

        {/* Kanji Character */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="mb-2 text-8xl font-black text-slate-800 drop-shadow-md filter dark:text-slate-100">
            学
          </div>
          <p className="text-sm font-medium tracking-widest text-slate-500 dark:text-slate-400">
            HỌC
          </p>
        </div>

        {/* Interactive Stats revealed on hover */}
        <div
          className={`mt-4 grid transform grid-cols-2 gap-4 transition-all duration-500 ${isHovered ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
        >
          <div className="rounded-xl bg-slate-100/80 p-3 text-center dark:bg-slate-800/80">
            <p className="text-[10px] font-bold uppercase text-slate-500">Onyomi</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">ガク</p>
          </div>
          <div className="rounded-xl bg-slate-100/80 p-3 text-center dark:bg-slate-800/80">
            <p className="text-[10px] font-bold uppercase text-slate-500">Kunyomi</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">まな-ぶ</p>
          </div>
        </div>

        {/* Example section always visible but expanded subtly */}
        <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-blue-600 dark:text-blue-400">学校</span> (gakkou)
            <br />
            Trường học (School)
          </p>
        </div>

        {/* Decorative elements */}
        <div className="pointer-events-none absolute right-2 top-2 -z-10 select-none text-6xl font-bold text-slate-100 opacity-50 dark:text-slate-800">
          学
        </div>
      </div>
    </div>
  );
}
