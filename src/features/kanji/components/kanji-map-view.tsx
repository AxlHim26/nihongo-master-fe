"use client";

import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import HeadphonesRoundedIcon from "@mui/icons-material/HeadphonesRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import KanjiDrawInput from "@/features/kanji/components/kanji-draw-input";
import KanjiSearch from "@/features/kanji/components/kanji-search";
import RadicalRelationMap from "@/features/kanji/components/radical-relation-map";
import { kanjiGroupLabel, type KanjiSearchEntry } from "@/features/kanji/data/kanji-search";
import type { KanjiExample, KanjiInfo } from "@/features/kanji/types/kanji-info";
import EmptyState from "@/shared/components/ui/empty-state";
import { cn } from "@/shared/utils/cn";

type FuriganaParts = {
  base: string;
  reading?: string;
};

const parseFurigana = (text: string): FuriganaParts => {
  const fullWidthStart = text.indexOf("（");
  const fullWidthEnd = text.indexOf("）");
  if (fullWidthStart !== -1 && fullWidthEnd !== -1 && fullWidthEnd > fullWidthStart) {
    return {
      base: text.slice(0, fullWidthStart) + text.slice(fullWidthEnd + 1),
      reading: text.slice(fullWidthStart + 1, fullWidthEnd),
    };
  }

  const start = text.indexOf("(");
  const end = text.indexOf(")");
  if (start !== -1 && end !== -1 && end > start) {
    return {
      base: text.slice(0, start) + text.slice(end + 1),
      reading: text.slice(start + 1, end),
    };
  }

  return { base: text };
};

const extractMeanings = (kanjiInfo: KanjiInfo | null) => {
  if (!kanjiInfo) return [] as string[];
  const meanings = new Set<string>();
  const mainMeaning = kanjiInfo.kanjialiveData?.meaning || kanjiInfo.jishoData?.meaning;
  if (mainMeaning) meanings.add(mainMeaning);

  const radicalMeaning =
    kanjiInfo.kanjialiveData?.radical?.meaning?.vietnamese ||
    kanjiInfo.kanjialiveData?.radical?.meaning?.english ||
    kanjiInfo.jishoData?.radical?.meaning;
  if (radicalMeaning) meanings.add(radicalMeaning);

  (kanjiInfo.kanjialiveData?.examples ?? []).forEach((example) => {
    const meaning = example.meaning?.vietnamese ?? example.meaning?.english;
    if (meaning) meanings.add(meaning);
  });

  return Array.from(meanings);
};

const getOnReadings = (kanjiInfo: KanjiInfo | null) => {
  if (!kanjiInfo) return [] as string[];
  if (kanjiInfo.jishoData?.onyomi?.length) return kanjiInfo.jishoData.onyomi;
  if (kanjiInfo.kanjialiveData?.onyomi_ja) return [kanjiInfo.kanjialiveData.onyomi_ja];
  return [];
};

const getKunReadings = (kanjiInfo: KanjiInfo | null) => {
  if (!kanjiInfo) return [] as string[];
  if (kanjiInfo.jishoData?.kunyomi?.length) return kanjiInfo.jishoData.kunyomi;
  if (kanjiInfo.kanjialiveData?.kunyomi_ja) return [kanjiInfo.kanjialiveData.kunyomi_ja];
  return [];
};

export default function KanjiMapView() {
  const [selected, setSelected] = useState<KanjiSearchEntry | null>(null);
  const [kanjiInfo, setKanjiInfo] = useState<KanjiInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [lang, setLang] = useState<"vi" | "en">("vi");

  const selectedKanji = selected?.kanji ?? "";

  useEffect(() => {
    if (!selectedKanji) return;

    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/kanji/${encodeURIComponent(selectedKanji)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "Không tìm thấy dữ liệu");
        }
        return res.json();
      })
      .then((data) => {
        if (active) setKanjiInfo(data as KanjiInfo);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedKanji]);

  const translationTexts = useMemo(() => extractMeanings(kanjiInfo), [kanjiInfo]);
  const missingKey = useMemo(() => {
    const missing = translationTexts.filter((text) => !translations[text]);
    return missing.length > 0 ? JSON.stringify(missing) : "";
  }, [translationTexts, translations]);

  useEffect(() => {
    if (!missingKey) return;
    const texts = JSON.parse(missingKey) as string[];
    let active = true;

    fetch("/api/kanji/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts }),
    })
      .then((res) => res.json())
      .then((data: { translations?: string[] }) => {
        if (!active) return;
        const translated = data.translations ?? [];
        setTranslations((prev) => {
          const next = { ...prev };
          texts.forEach((text, index) => {
            const value = translated[index];
            if (value) next[text] = value;
          });
          return next;
        });
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [missingKey]);

  const translate = useCallback(
    (text?: string) => {
      if (!text) return undefined;
      return translations[text];
    },
    [translations],
  );

  const onReadings = useMemo(() => getOnReadings(kanjiInfo), [kanjiInfo]);
  const kunReadings = useMemo(() => getKunReadings(kanjiInfo), [kanjiInfo]);
  const examples = useMemo(() => kanjiInfo?.kanjialiveData?.examples ?? [], [kanjiInfo]);

  const mainMeaning = useMemo(() => {
    const rawMeaning =
      kanjiInfo?.meaning || kanjiInfo?.kanjialiveData?.meaning || kanjiInfo?.jishoData?.meaning;
    const meaning =
      typeof rawMeaning === "string"
        ? rawMeaning
        : rawMeaning?.[lang] || rawMeaning?.["en"] || rawMeaning?.["vi"] || undefined;
    return (
      meaning ||
      translate(
        typeof rawMeaning === "string" ? rawMeaning : rawMeaning?.["en"] || rawMeaning?.["vi"],
      )
    );
  }, [kanjiInfo, translate, lang]);

  const hanVietExplain = useMemo(() => {
    const raw = kanjiInfo?.hanVietExplain;
    if (!raw) return null;
    return typeof raw === "object" ? raw[lang] || raw["en"] || raw["vi"] : raw;
  }, [kanjiInfo, lang]);

  const handleSelectChange = useCallback((entry: KanjiSearchEntry | null) => {
    setSelected(entry);
    if (!entry) {
      setKanjiInfo(null);
      setError(null);
    }
  }, []);

  const playAudio = useCallback((example: KanjiExample) => {
    const audioUrl =
      example.audio?.mp3 || example.audio?.ogg || example.audio?.aac || example.audio?.opus;
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.play().catch(() => undefined);
  }, []);

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700}>
          Kanji map
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tra cứu, luyện viết và theo dõi tiến độ ghi nhớ kanji theo cấp độ JLPT
        </Typography>
      </Stack>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <Paper
            elevation={0}
            className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-6"
          >
            <div className="flex gap-2">
              <div className="flex-1">
                <KanjiSearch value={selected} onChange={handleSelectChange} />
              </div>
              <Tooltip title={lang === "vi" ? "Chuyển sang tiếng Anh" : "Chuyển sang tiếng Việt"}>
                <button
                  onClick={() => setLang(lang === "vi" ? "en" : "vi")}
                  className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-sm font-bold text-[var(--app-fg)] transition hover:bg-[var(--app-border)]"
                >
                  {lang.toUpperCase()}
                </button>
              </Tooltip>
            </div>
          </Paper>

          <Paper
            elevation={0}
            className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="subtitle1" fontWeight={600}>
                  Vẽ kanji
                </Typography>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-[var(--app-surface-2)] dark:text-[var(--app-fg-muted)]">
                <AutoStoriesRoundedIcon fontSize="small" />
              </div>
            </div>
            <div className="mt-5">
              <KanjiDrawInput onSelect={handleSelectChange} />
            </div>
          </Paper>
        </div>

        <Paper
          elevation={0}
          className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-6"
        >
          {!selected ? (
            <EmptyState
              icon={<InfoOutlinedIcon fontSize="small" />}
              title="Chưa chọn kanji"
              description="Chọn một kanji từ thanh tìm kiếm hoặc vẽ vào bảng để xem chi tiết."
            />
          ) : loading ? (
            <div className="flex h-full items-center justify-center text-sm text-[var(--app-muted)]">
              Đang tải dữ liệu kanji...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-bg)] p-4 text-sm text-rose-500">
              {error}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-[var(--app-border)] bg-[var(--app-bg)] text-4xl font-semibold">
                  {selectedKanji}
                </div>
                <div>
                  <Typography variant="h6" fontWeight={700}>
                    {selectedKanji}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nhóm: {kanjiGroupLabel[selected.group]}
                  </Typography>
                </div>
              </div>

              {/* Âm Hán Việt */}
              {(kanjiInfo?.hanViet?.[0] || kanjiInfo?.amHanViet) && (
                <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 text-center">
                  <Typography
                    variant="caption"
                    className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-muted)]"
                  >
                    Âm Hán Việt
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    className="mt-1 capitalize text-blue-600 dark:text-blue-400"
                  >
                    {kanjiInfo?.hanViet?.[0] || kanjiInfo?.amHanViet}
                  </Typography>
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

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
                  <Typography variant="caption" className="text-[var(--app-muted)]">
                    Âm On (音読み)
                  </Typography>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {onReadings.length ? (
                      onReadings.map((reading) => (
                        <span
                          key={`on-${reading}`}
                          className="rounded-full border border-[var(--app-border)] bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-[#161D2A] dark:text-[#E5E7EB]"
                        >
                          {reading}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[var(--app-muted)]">Chưa có dữ liệu</span>
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
                  <Typography variant="caption" className="text-[var(--app-muted)]">
                    Âm Kun (訓読み)
                  </Typography>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {kunReadings.length ? (
                      kunReadings.map((reading) => (
                        <span
                          key={`kun-${reading}`}
                          className="rounded-full border border-[var(--app-border)] bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-[#161D2A] dark:text-[#E5E7EB]"
                        >
                          {reading}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[var(--app-muted)]">Chưa có dữ liệu</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
                <Typography variant="caption" className="text-[var(--app-muted)]">
                  {lang === "vi" ? "Nghĩa tiếng Việt" : "English Meaning"}
                </Typography>
                <Typography variant="subtitle1" fontWeight={600} className="mt-1">
                  {mainMeaning || "Chưa có nghĩa"}
                </Typography>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Typography variant="subtitle1" fontWeight={600}>
                    Từ vựng có chữ hán
                  </Typography>
                  <div className="flex items-center gap-2 text-xs text-[var(--app-muted)]">
                    <HeadphonesRoundedIcon fontSize="inherit" />
                    <span>Audio mẫu</span>
                  </div>
                </div>
                {examples.length ? (
                  <div className="max-h-[270px] space-y-3 overflow-y-auto pr-1">
                    {examples.map((example) => (
                      <KanjiExampleRow
                        key={example.japanese}
                        example={example}
                        onPlay={playAudio}
                        translate={translate}
                        lang={lang}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-bg)] p-4 text-sm text-[var(--app-muted)]">
                    Chưa có ví dụ từ vựng cho kanji này.
                  </div>
                )}
              </div>
            </div>
          )}
        </Paper>
      </div>

      {selected && !loading && !error && <RadicalRelationMap kanjiInfo={kanjiInfo} />}
    </Stack>
  );
}

type KanjiExampleRowProps = {
  example: KanjiExample;
  onPlay: (example: KanjiExample) => void;
  translate: (text?: string) => string | undefined;
  lang: "vi" | "en";
};

const KanjiExampleRow = React.memo(function KanjiExampleRow({
  example,
  onPlay,
  translate,
  lang,
}: KanjiExampleRowProps) {
  const { base, reading } = parseFurigana(example.japanese);

  const rawMeaning = example.meaning;
  let meaningFallback = "";

  if (typeof rawMeaning === "object" && rawMeaning !== null) {
    const raw = rawMeaning as Record<string, string>;
    if (lang === "vi") {
      meaningFallback =
        raw["vi"] ||
        raw["vietnamese"] ||
        translate(raw["en"] || raw["english"]) ||
        raw["en"] ||
        raw["english"] ||
        "Chưa có nghĩa";
    } else {
      meaningFallback =
        raw["en"] || raw["english"] || raw["vi"] || raw["vietnamese"] || "Chưa có nghĩa";
    }
  } else if (typeof rawMeaning === "string") {
    meaningFallback = rawMeaning;
  }

  const meaning = meaningFallback;

  // Support hanVietExplain for examples if they exist
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hanVietExplainRaw = (example as any).hanVietExplain;
  const hanVietExplain =
    typeof hanVietExplainRaw === "object"
      ? hanVietExplainRaw[lang] || hanVietExplainRaw["en"] || hanVietExplainRaw["vi"]
      : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
      <div>
        <div className="text-lg font-semibold">
          {reading ? (
            <ruby>
              {base}
              <rt className="text-xs text-[var(--app-muted)]">{reading}</rt>
            </ruby>
          ) : (
            base
          )}
        </div>
        <div className="text-sm text-[var(--app-muted)]">{meaning ?? "Chưa có nghĩa"}</div>

        {hanVietExplain && (
          <div className="mt-2 rounded border border-[var(--app-border)] bg-[var(--app-card)] p-2 text-xs text-[var(--app-fg)]">
            {hanVietExplain}
          </div>
        )}
      </div>
      <button
        type="button"
        className={cn(
          "flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition",
          "hover:-translate-y-[1px] hover:border-blue-200 dark:hover:border-[var(--app-active-border)] dark:hover:bg-[var(--app-surface-2)]",
          "dark:bg-[#161D2A] dark:text-[#E5E7EB]",
        )}
        onClick={() => onPlay(example)}
      >
        <PlayArrowRoundedIcon fontSize="small" />
        Nghe
      </button>
    </div>
  );
});
