"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import DrawRoundedIcon from "@mui/icons-material/DrawRounded";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import TranslateIcon from "@mui/icons-material/Translate";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import * as React from "react";
import * as wanakana from "wanakana";

import KanjiStrokeOrder from "@/features/kanji/components/kanji-stroke-order";
import type { KanjiInfo, KanjiSummary } from "@/features/kanji/types/kanji-info";
import { cn } from "@/shared/utils/cn";

type KanjiDetailDialogProps = {
  open: boolean;
  kanjiInfo: KanjiInfo | null;
  kanjiSummary: KanjiSummary | null;
  loading: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  lang?: "vi" | "en";
  onLangChange?: (lang: "vi" | "en") => void;
  onUpdateKanjiInfo?: (newInfo: KanjiInfo) => void;
};

export default function KanjiDetailDialog({
  open,
  kanjiInfo,
  kanjiSummary,
  loading,
  onClose,
  onPrev,
  onNext,
  lang = "vi",
  onLangChange: _onLangChange,
  onUpdateKanjiInfo,
}: KanjiDetailDialogProps) {
  const kanji = kanjiSummary?.kanji ?? kanjiInfo?.id ?? "";
  const rawMeaning =
    kanjiInfo?.meaning ||
    kanjiSummary?.meaning ||
    kanjiInfo?.kanjialiveData?.meaning ||
    kanjiInfo?.jishoData?.meaning ||
    "";
  const meaning =
    typeof rawMeaning === "string"
      ? rawMeaning
      : rawMeaning[lang] || rawMeaning["en"] || rawMeaning["vi"] || "";
  const onyomi =
    kanjiInfo?.kanjialiveData?.onyomi_ja ||
    (kanjiInfo?.jishoData?.onyomi ?? []).join("、") ||
    kanjiSummary?.onyomi ||
    "";
  const kunyomi =
    kanjiInfo?.kanjialiveData?.kunyomi_ja ||
    (kanjiInfo?.jishoData?.kunyomi ?? []).join("、") ||
    kanjiSummary?.kunyomi ||
    "";
  const jlptLevel = kanjiInfo?.jishoData?.jlptLevel ?? kanjiSummary?.jlptLevel ?? "";
  const index = kanjiSummary?.index ?? 0;
  const mnHint = (kanjiInfo?.kanjialiveData as Record<string, unknown>)?.["mn_hint"] as
    | string
    | undefined;
  const _amHanViet = kanjiSummary?.amHanViet || kanjiInfo?.amHanViet || "";
  const hanViet = kanjiSummary?.hanViet || kanjiInfo?.hanViet || [];
  const displayHanViet = hanViet.length > 0 ? hanViet[0] : "";
  const jishoUri = (kanjiInfo?.jishoData as Record<string, unknown>)?.["uri"] as string | undefined;

  const hanVietExplainRaw = kanjiSummary?.hanVietExplain || kanjiInfo?.hanVietExplain;
  const hanVietExplain =
    typeof hanVietExplainRaw === "object"
      ? hanVietExplainRaw[lang] || hanVietExplainRaw["en"] || hanVietExplainRaw["vi"]
      : null;

  const [showStrokeOrder, setShowStrokeOrder] = React.useState(false);
  const [isTranslating, setIsTranslating] = React.useState(false);

  React.useEffect(() => {
    // Reset stroke order view when kanji changes
    setShowStrokeOrder(false);
  }, [kanji]);

  const vocabItems = React.useMemo(() => {
    if (!kanjiInfo?.jishoData) return [];

    // Aggregate examples from jishoData
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: Array<any> = [];
    const seen = new Set<string>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addExamples = (examples: any[]) => {
      if (!Array.isArray(examples)) return;
      examples.forEach((ex) => {
        if (!ex.example || seen.has(ex.example)) return;
        seen.add(ex.example);
        items.push({
          word: ex.example,
          reading: ex.reading,
          romaji: ex.romaji || wanakana.toRomaji(ex.reading || ""),
          meaning: ex.meaning,
        });
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addExamples(kanjiInfo.jishoData.kunyomiExamples as any[]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addExamples(kanjiInfo.jishoData.onyomiExamples as any[]);
    return items;
  }, [kanjiInfo]);

  const hasMissingViMeaning = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return vocabItems.some((ex: any) => {
      const type = typeof ex.meaning;
      if (type === "string") return true;
      if (type === "object" && ex.meaning) {
        return !ex.meaning.vi && !ex.meaning.vietnamese && (ex.meaning.en || ex.meaning.english);
      }
      return false;
    });
  }, [vocabItems]);

  const handleTranslateVocab = async () => {
    if (!kanji) return;
    try {
      setIsTranslating(true);
      const res = await fetch("/api/kanji/vocab/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kanji }),
      });
      if (res.ok) {
        const { data } = await res.json();
        if (data && onUpdateKanjiInfo) {
          onUpdateKanjiInfo(data);
        }
      } else {
        console.error("Translation failed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  };

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && onPrev) {
        e.preventDefault();
        onPrev();
      }
      if (e.key === "ArrowRight" && onNext) {
        e.preventDefault();
        onNext();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onPrev, onNext, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className:
          "!rounded-3xl !bg-[var(--app-card)] border border-[var(--app-border)] !shadow-2xl !max-w-[720px]",
      }}
    >
      <div className="relative flex flex-col p-0 sm:flex-row">
        {/* Nav arrows */}
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-muted)] shadow-sm transition hover:text-[var(--app-fg)] sm:left-3"
          >
            <ChevronLeftIcon fontSize="small" />
          </button>
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-muted)] shadow-sm transition hover:text-[var(--app-fg)] sm:right-3"
          >
            <ChevronRightIcon fontSize="small" />
          </button>
        )}

        {/* Close */}
        <IconButton
          onClick={onClose}
          size="small"
          className="!absolute !right-3 !top-3 !z-20 !text-[var(--app-muted)]"
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {loading ? (
          <div className="flex min-h-[400px] w-full items-center justify-center text-sm text-[var(--app-muted)]">
            Đang tải dữ liệu...
          </div>
        ) : (
          <>
            {/* Left Panel — Kanji display */}
            <div className="flex w-full flex-col items-center justify-center border-b border-[var(--app-border)] bg-gradient-to-b from-slate-50 to-white p-8 dark:from-[#1A2030] dark:to-[#161D2A] sm:w-[240px] sm:border-b-0 sm:border-r">
              {showStrokeOrder ? (
                <div className="flex h-32 items-center justify-center">
                  <KanjiStrokeOrder kanji={kanji} size={110} />
                </div>
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-2 border-slate-200 bg-white text-7xl font-bold text-slate-800 shadow-inner dark:border-[#3A4658] dark:bg-[#1A2231] dark:text-[#E5E7EB]">
                  {kanji}
                </div>
              )}
              {displayHanViet && (
                <div className="mt-4 text-center text-xl font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {displayHanViet}
                </div>
              )}
              {meaning && (
                <div className="mt-1 text-center text-xs text-[var(--app-muted)]">{meaning}</div>
              )}

              <div className="mt-5 flex items-center gap-2">
                {index > 0 && (
                  <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--app-muted)]">
                    #{index}
                  </span>
                )}
                {jlptLevel && (
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-600 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400">
                    {jlptLevel}
                  </span>
                )}
              </div>

              {/* Onyomi / Kunyomi */}
              <div className="mt-5 w-full space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-muted)]">
                    Onyomi
                  </span>
                  <span className="text-sm font-semibold">{onyomi || "—"}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-muted)]">
                    Kunyomi
                  </span>
                  <span className="text-sm font-semibold">{kunyomi || "—"}</span>
                </div>
              </div>
            </div>

            {/* Right Panel — Details */}
            <div className="flex-1 space-y-5 p-6">
              <div>
                <h2 className="text-lg font-bold">Chi tiết & Từ vựng</h2>
                <p className="text-xs text-[var(--app-muted)]">Mở rộng vốn từ với Hán tự này</p>
              </div>

              {/* Mnemonic hint */}
              {mnHint && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--app-muted)]">
                    <LightbulbOutlinedIcon fontSize="inherit" />
                    Mẹo ghi nhớ
                  </div>
                  <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3 text-sm italic text-[var(--app-fg)]">
                    {mnHint}
                  </div>
                </div>
              )}

              {/* Han Viet Explain */}
              {hanVietExplain && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--app-muted)]">
                    <LightbulbOutlinedIcon fontSize="inherit" />
                    {lang === "vi" ? "Giải nghĩa Hán Việt" : "Sino-Vietnamese Explanation"}
                  </div>
                  <div className="rounded-xl border border-[var(--app-border)] bg-blue-50/50 p-3 text-sm text-[var(--app-fg)] dark:border-blue-900/30 dark:bg-blue-900/10">
                    {hanVietExplain}
                  </div>
                </div>
              )}

              {/* Examples */}
              <div className="min-h-[160px] flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--app-muted)]">
                    <StarBorderRoundedIcon fontSize="inherit" />
                    Từ vựng tiêu biểu
                  </div>
                  {lang === "vi" && hasMissingViMeaning && onUpdateKanjiInfo && (
                    <button
                      type="button"
                      disabled={isTranslating}
                      onClick={handleTranslateVocab}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1 text-xs font-semibold text-blue-600 transition",
                        isTranslating
                          ? "cursor-wait opacity-50"
                          : "hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30",
                      )}
                    >
                      <TranslateIcon fontSize="small" className="text-[14px]" />
                      {isTranslating ? "Đang dịch..." : "Dịch nhánh từ vựng (AI)"}
                    </button>
                  )}
                </div>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton
                        key={`skel-${i}`}
                        variant="rounded"
                        height={48}
                        className="!rounded-xl"
                        sx={{ bgcolor: "var(--app-bg)" }}
                      />
                    ))}
                  </div>
                ) : vocabItems.length > 0 ? (
                  <div className="max-h-[220px] space-y-3 overflow-y-auto pr-1">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {vocabItems.map((ex: any, idx: number) => {
                      const meaningStr =
                        typeof ex.meaning === "string"
                          ? ex.meaning
                          : ex.meaning?.[lang] ||
                            ex.meaning?.["en"] ||
                            ex.meaning?.["vi"] ||
                            "Chưa có nghĩa";
                      return (
                        <div
                          key={`${ex.word}-${idx}`}
                          className="flex flex-col items-start justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
                              {ex.word}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-col gap-0.5">
                            {ex.reading && (
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                {ex.reading}
                              </span>
                            )}
                            {ex.romaji && (
                              <span className="text-xs font-semibold uppercase tracking-wide text-blue-600/80 dark:text-blue-400/80">
                                {ex.romaji}
                              </span>
                            )}
                            {meaningStr && (
                              <span className="mt-1.5 text-sm leading-snug text-[var(--app-muted)]">
                                {meaningStr}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-[100px] items-center justify-center rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-bg)] p-4 text-center text-xs text-[var(--app-muted)]">
                    Chưa có từ vựng nào được thêm.
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                {jishoUri && (
                  <a
                    href={jishoUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-4 py-2.5 text-sm font-semibold text-[var(--app-fg)] transition",
                      "hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700",
                    )}
                  >
                    <MenuBookRoundedIcon fontSize="small" />
                    Tra từ điển
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setShowStrokeOrder(!showStrokeOrder)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition",
                    showStrokeOrder
                      ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                      : "border-transparent bg-blue-600 text-white hover:bg-blue-700",
                  )}
                >
                  <DrawRoundedIcon fontSize="small" />
                  {showStrokeOrder ? "Ẩn hộp viết" : "Luyện viết"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
