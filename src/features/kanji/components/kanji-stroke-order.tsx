"use client";

import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import HanziWriter from "hanzi-writer";
import { useEffect, useRef, useState } from "react";

interface KanjiStrokeOrderProps {
  kanji: string;
  size?: number;
}

export default function KanjiStrokeOrder({ kanji, size = 150 }: KanjiStrokeOrderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const writerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !kanji) return;

    // Clear previous writer
    containerRef.current.innerHTML = "";

    // Initialize writer
    const writer = HanziWriter.create(containerRef.current, kanji, {
      width: size,
      height: size,
      padding: 5,
      showOutline: true,
      strokeAnimationSpeed: 1.5,
      delayBetweenStrokes: 150,
      strokeColor: "#2563EB", // Tailwind blue-600
      radicalColor: "#2563EB",
      outlineColor: "#E2E8F0", // Tailwind slate-200
    });

    writerRef.current = writer;

    return () => {
      if (writerRef.current) {
        writerRef.current.cancelQuiz();
      }
    };
  }, [kanji, size]);

  const handlePlay = () => {
    if (!writerRef.current) return;
    writerRef.current.animateCharacter({
      onComplete: () => setIsPlaying(false),
    });
    setIsPlaying(true);
  };

  const handlePause = () => {
    if (!writerRef.current) return;
    // HanziWriter pause isn't natively supported for standard animations in simple ways
    // without using quiz, but we can restart or cancel.
    // Let's implement cancel animation as a 'stop' instead.
    writerRef.current.cancelQuiz();
    setIsPlaying(false);
  };

  const handleRestart = () => {
    if (!writerRef.current) return;
    setIsPlaying(true);
    writerRef.current.hideCharacter();
    writerRef.current.animateCharacter({
      onComplete: () => setIsPlaying(false),
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="rounded-2xl border-2 border-slate-200 bg-white shadow-inner dark:border-slate-700 dark:bg-slate-800"
        style={{ width: size, height: size }}
      />
      <div className="flex items-center gap-2">
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
          title={isPlaying ? "Dừng" : "Phát"}
        >
          {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
        </button>
        <button
          onClick={handleRestart}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          title="Vẽ lại"
        >
          <RestartAltRoundedIcon />
        </button>
      </div>
    </div>
  );
}
