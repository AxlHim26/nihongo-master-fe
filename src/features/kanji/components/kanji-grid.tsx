"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";

import KanjiDetailDialog from "@/features/kanji/components/kanji-detail-dialog";
import type { KanjiInfo, KanjiListResponse, KanjiSummary } from "@/features/kanji/types/kanji-info";
import { cn } from "@/shared/utils/cn";

type KanjiGridProps = {
  level: string;
};

const LEVEL_LABELS: Record<string, string> = {
  n5: "JLPT N5",
  n4: "JLPT N4",
  n3: "JLPT N3",
  n2: "JLPT N2",
  n1: "JLPT N1",
};

const PAGE_SIZE = 20;

export default function KanjiGrid({ level }: KanjiGridProps) {
  const [data, setData] = useState<KanjiListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [kanjiDetail, setKanjiDetail] = useState<KanjiInfo | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lang, setLang] = useState<"vi" | "en">("vi");

  const levelNum = level.replace("n", "");

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch(`/api/kanji/jlpt/${levelNum}?page=${page}&size=${PAGE_SIZE}`)
      .then((res) => res.json())
      .then((json: KanjiListResponse) => {
        if (active) setData(json);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [levelNum, page]);

  const openDetail = useCallback((kanji: KanjiSummary, idx: number) => {
    setSelectedIndex(idx);
    setDetailLoading(true);

    fetch(`/api/kanji/${encodeURIComponent(kanji.kanji)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((json: KanjiInfo) => setKanjiDetail(json))
      .catch(() => setKanjiDetail(null))
      .finally(() => setDetailLoading(false));
  }, []);

  const navigateDetail = useCallback(
    (direction: -1 | 1) => {
      if (!data || selectedIndex === null) return;
      const newIndex = selectedIndex + direction;
      if (newIndex < 0 || newIndex >= data.items.length) return;
      const nextKanji = data.items[newIndex];
      if (!nextKanji) return;
      openDetail(nextKanji, newIndex);
    },
    [data, selectedIndex, openDetail],
  );

  const closeDetail = useCallback(() => {
    setSelectedIndex(null);
    setKanjiDetail(null);
  }, []);

  const filteredItems = React.useMemo(() => {
    if (!data?.items) return [];
    if (!search.trim()) return data.items;
    const q = search.trim().toLowerCase();
    return data.items.filter((item) => {
      const meaningStr =
        typeof item.meaning === "string"
          ? item.meaning
          : `${item.meaning?.["vi"] || ""} ${item.meaning?.["en"] || ""}`;

      return (
        item.kanji.includes(q) ||
        meaningStr.toLowerCase().includes(q) ||
        item.onyomi.toLowerCase().includes(q) ||
        item.kunyomi.toLowerCase().includes(q)
      );
    });
  }, [data, search]);

  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const startNum = (page - 1) * PAGE_SIZE + 1;
  const endNum = Math.min(page * PAGE_SIZE, total);

  const paginationButtons = React.useMemo(() => {
    const pages: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }, [totalPages, page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography variant="h5" fontWeight={700}>
            Kho Hán tự {LEVEL_LABELS[level] ?? level}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Phát triển lộ trình học tập tối ưu (Thời gian load kanji hơi lâu có thể từ 5-20s)
          </Typography>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchRoundedIcon
              fontSize="small"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-muted)]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm Kanji, âm Hán..."
              className="h-10 w-64 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] pl-9 pr-3 text-sm text-[var(--app-fg)] outline-none transition placeholder:text-[var(--app-muted)] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
            />
          </div>

          <Tooltip title={lang === "vi" ? "Chuyển sang tiếng Anh" : "Chuyển sang tiếng Việt"}>
            <button
              onClick={() => setLang(lang === "vi" ? "en" : "vi")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-sm font-bold text-[var(--app-fg)] transition hover:bg-[var(--app-border)]"
            >
              {lang.toUpperCase()}
            </button>
          </Tooltip>

          <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2 text-xs font-semibold text-[var(--app-muted)]">
            Trang {page}/{totalPages}
          </span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={`skel-${i}`}
              className="aspect-square animate-pulse rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)]"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredItems.map((item, idx) => (
            <button
              key={item.kanji}
              type="button"
              onClick={() => openDetail(item, idx)}
              className={cn(
                "group relative flex aspect-square flex-col items-center justify-center rounded-2xl border bg-[var(--app-card)] p-3 text-center transition-all",
                "border-[var(--app-border)] hover:border-blue-400 hover:shadow-md hover:shadow-blue-50 dark:hover:shadow-blue-950/20",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                selectedIndex === idx &&
                  "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30",
              )}
            >
              {/* Index */}
              <span className="absolute left-2.5 top-2 text-[10px] font-medium text-[var(--app-muted)]">
                {item.index}
              </span>

              {/* Onyomi (top right) */}
              {item.onyomi && (
                <span className="absolute right-2.5 top-2 text-[10px] font-medium text-[var(--app-muted)]">
                  {item.onyomi.split("、")[0]}
                </span>
              )}

              {/* Kanji */}
              <span className="text-3xl font-bold leading-none tracking-tight sm:text-4xl">
                {item.kanji}
              </span>

              {/* Han Viet */}
              {item.hanViet && item.hanViet.length > 0 && (
                <span className="mt-2 line-clamp-1 w-full px-1 text-center text-[11px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  {item.hanViet[0]}
                </span>
              )}

              {/* Meaning */}
              {item.meaning && (
                <span className="mt-0.5 line-clamp-1 w-full px-1 text-center text-[9px] text-[var(--app-muted)]">
                  {typeof item.meaning === "string"
                    ? item.meaning
                    : item.meaning[lang] || item.meaning["en"] || item.meaning["vi"]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pb-4">
          <span className="mr-4 text-xs text-[var(--app-muted)]">
            Hiển thị {startNum} – {endNum} trong số {total} Hán tự
          </span>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-muted)] transition hover:text-[var(--app-fg)] disabled:opacity-40"
          >
            <ChevronLeftIcon fontSize="small" />
          </button>
          {paginationButtons.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-1 text-xs text-[var(--app-muted)]">
                ...
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p as number)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition",
                  page === p
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-muted)] hover:text-[var(--app-fg)]",
                )}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-muted)] transition hover:text-[var(--app-fg)] disabled:opacity-40"
          >
            <ChevronRightIcon fontSize="small" />
          </button>
        </div>
      )}

      {/* Detail Dialog */}
      {selectedIndex !== null && (
        <KanjiDetailDialog
          open
          kanjiInfo={kanjiDetail}
          loading={detailLoading}
          kanjiSummary={data?.items[selectedIndex] ?? null}
          lang={lang}
          onLangChange={setLang}
          onUpdateKanjiInfo={setKanjiDetail}
          onClose={closeDetail}
          {...(selectedIndex > 0 ? { onPrev: () => navigateDetail(-1) } : {})}
          {...(data && selectedIndex < data.items.length - 1
            ? { onNext: () => navigateDetail(1) }
            : {})}
        />
      )}
    </div>
  );
}
