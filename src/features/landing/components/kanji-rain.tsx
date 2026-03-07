"use client";

import React, { memo, useEffect, useState } from "react";

const CHARACTERS = [
  // Kanji JLPT N5/N4
  "日",
  "月",
  "火",
  "水",
  "木",
  "金",
  "土",
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
  "十",
  "百",
  "千",
  "万",
  "円",
  "時",
  "人",
  "男",
  "女",
  "子",
  "目",
  "口",
  "耳",
  "手",
  "足",
  "力",
  "学",
  "校",
  "先",
  "生",
  "山",
  "川",
  "田",
  "石",
  "花",
  "竹",
  "雨",
  "空",
  "上",
  "下",
  "左",
  "右",
  "本",
  "語",
  "名",
  "字",
  "大",
  "小",
  "中",
  "高",
  "新",
  "古",
  "白",
  "黒",
  "赤",
  "青",
  "明",
  "暗",
  "安",
  "高",
  // Hiragana
  "あ",
  "い",
  "う",
  "え",
  "お",
  "か",
  "き",
  "く",
  "け",
  "こ",
  "さ",
  "し",
  "す",
  "せ",
  "そ",
  "た",
  "ち",
  "つ",
  "て",
  "と",
  // Katakana
  "ア",
  "イ",
  "ウ",
  "エ",
  "オ",
  "カ",
  "キ",
  "ク",
  "ケ",
  "コ",
  "サ",
  "シ",
  "ス",
  "セ",
  "ソ",
  "タ",
  "チ",
  "ツ",
  "テ",
  "ト",
];

interface Drop {
  id: number;
  char: string;
  x: number;
  delay: number;
  duration: number;
  fontSize: number;
  opacity: number;
}

const KanjiRainMemo = memo(function KanjiRainBase() {
  const [drops, setDrops] = useState<Drop[]>([]);

  useEffect(() => {
    // Generate only client-side to avoid hydration mismatch
    const generateDrops = () => {
      const dropCount = Math.floor(window.innerWidth / 40); // 1 drop per 40px width roughly
      const newDrops: Drop[] = [];
      for (let i = 0; i < dropCount; i++) {
        newDrops.push({
          id: i,
          char: CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)] || "日",
          x: Math.random() * 100, // percentage string
          delay: Math.random() * 10, // seconds
          duration: 10 + Math.random() * 15, // seconds (10 to 25s)
          fontSize: 12 + Math.random() * 24, // 12px to 36px
          opacity: 0.05 + Math.random() * 0.15, // very light 5% to 20%
        });
      }
      return newDrops;
    };

    setDrops(generateDrops());

    const handleResize = () => {
      setDrops(generateDrops());
    };

    let resizeTimer: NodeJS.Timeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 200);
    });

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (drops.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute -top-[10%] animate-kanji-drop select-none font-bold text-slate-400 dark:text-slate-600"
          style={{
            left: `${drop.x}%`,
            fontSize: `${drop.fontSize}px`,
            opacity: drop.opacity,
            animationDuration: `${drop.duration}s`,
            animationDelay: `${drop.delay}s`,
            textShadow: "0 0 10px currentColor",
          }}
        >
          {drop.char}
        </div>
      ))}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-950" />
    </div>
  );
});

export default function KanjiRain() {
  return <KanjiRainMemo />;
}
