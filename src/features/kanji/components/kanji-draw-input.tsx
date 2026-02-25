"use client";

import BackspaceRoundedIcon from "@mui/icons-material/BackspaceRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  type KanjiSearchEntry,
  kanjiSearchOptions,
  kanjiSearchSet,
} from "@/features/kanji/data/kanji-search";
import Handwriting from "@/features/kanji/lib/handwriting";
import { cn } from "@/shared/utils/cn";

const CANVAS_SIZE = 220;

const getResolvedTheme = () => {
  if (typeof document === "undefined") {
    return "light";
  }
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

type KanjiDrawInputProps = {
  onSelect: (entry: KanjiSearchEntry) => void;
};

export default function KanjiDrawInput({ onSelect }: KanjiDrawInputProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<InstanceType<typeof Handwriting.Canvas> | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const inputOptions = useMemo(
    () => ({
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      language: "ja",
      numOfWords: 1,
      numOfReturn: 64,
    }),
    [],
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    const can = new Handwriting.Canvas(canvasRef.current, getResolvedTheme());
    setCanvas(can);
  }, []);

  const handleRecognize = () => {
    if (!canvas) return;
    canvas.recognize(canvas.getTrace(), inputOptions, (result, err) => {
      if (err) return;
      const filtered = result.filter((entry) => kanjiSearchSet.has(entry)).slice(0, 4);
      setSuggestions(filtered);
    });
  };

  const handleClear = () => {
    canvas?.erase();
    setSuggestions([]);
  };

  const handleSelectSuggestion = (kanji: string) => {
    const found = kanjiSearchOptions.find((entry) => entry.kanji === kanji);
    if (found) {
      onSelect(found);
    }
    handleClear();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="pointer-events-none absolute left-1/2 top-0 h-full -translate-x-1/2 border-l border-dashed border-slate-300/70 dark:border-[#3A4658]" />
        <div className="pointer-events-none absolute left-0 top-1/2 w-full -translate-y-1/2 border-t border-dashed border-slate-300/70 dark:border-[#3A4658]" />
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="touch-none rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] shadow-sm"
        />
      </div>

      <div className="flex w-full items-center justify-between gap-3">
        <Tooltip title="Xóa nét vẽ">
          <IconButton onClick={handleClear} className="border border-[var(--app-border)]">
            <BackspaceRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <div className="flex flex-1 items-center justify-center gap-2">
          {suggestions.length === 0 ? (
            <Typography variant="caption" className="text-[var(--app-muted)]">
              Gợi ý sẽ xuất hiện ở đây
            </Typography>
          ) : (
            suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--app-border)] bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-[1px]",
                  "dark:bg-[#161D2A] dark:text-[#E5E7EB]",
                )}
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))
          )}
        </div>

        <Tooltip title="Nhận diện">
          <IconButton
            onClick={handleRecognize}
            className="border border-[var(--app-border)] bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-[var(--app-surface-2)] dark:text-[var(--app-fg)] dark:hover:bg-[var(--app-card)]"
          >
            <SearchRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}
