"use client";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { useMemo } from "react";

import radicallist from "@/features/kanji/data/radicallist.json";
import type { KanjiInfo } from "@/features/kanji/types/kanji-info";

const POSITION_NAMES = [
  "ashi",
  "gyougamae",
  "hakogamae",
  "hen",
  "kanmuri",
  "keigamae",
  "kigamae",
  "kunigamae",
  "mongamae",
  "nyou",
  "tare",
  "tsukuri",
  "tsutsumigamae",
] as const;

type PositionName = (typeof POSITION_NAMES)[number];

type RadicalEntry = {
  radical: string;
  meaning?: string;
  readingJapanese?: string;
  positionRomanized?: string;
  frequency?: string;
  alternatives?: string[];
  strokes?: string;
};

type KanjiRadicalMapProps = {
  kanjiInfo: KanjiInfo | null;
  translate: (text?: string) => string | undefined;
};

const toPositionName = (pos?: string | null): PositionName | null => {
  if (!pos) return null;
  const lower = pos.toLowerCase();
  for (const name of POSITION_NAMES) {
    if (lower.includes(name)) return name;
  }
  return null;
};

export default function KanjiRadicalMap({ kanjiInfo, translate }: KanjiRadicalMapProps) {
  const { baseRadicalChar, baseEntry, alternatives } = useMemo(() => {
    const baseRadical =
      kanjiInfo?.kanjialiveData?.radical?.character?.trim() ||
      kanjiInfo?.jishoData?.radical?.symbol?.trim() ||
      "";
    const radicalMap = new Map<string, RadicalEntry>();
    const altToBaseMap = new Map<string, RadicalEntry>();

    (radicallist as RadicalEntry[]).forEach((entry) => {
      if (entry?.radical) radicalMap.set(entry.radical, entry);
    });

    (radicallist as RadicalEntry[]).forEach((entry) => {
      const alts = Array.isArray(entry?.alternatives) ? entry.alternatives : [];
      alts.forEach((alt) => {
        if (alt && !altToBaseMap.has(alt)) {
          altToBaseMap.set(alt, entry);
        }
      });
    });

    let base = radicalMap.get(baseRadical);
    if (!base) base = altToBaseMap.get(baseRadical) ?? undefined;

    const altList = (base?.alternatives ?? []).map((char) => {
      const entry = radicalMap.get(char);
      return {
        char,
        posName: toPositionName(entry?.positionRomanized ?? ""),
      };
    });

    return {
      baseRadicalChar: baseRadical,
      baseEntry: base ?? null,
      alternatives: altList,
    };
  }, [kanjiInfo]);

  if (!kanjiInfo) {
    return null;
  }

  const radicalMeaning =
    kanjiInfo.kanjialiveData?.radical?.meaning?.vietnamese ||
    kanjiInfo.kanjialiveData?.radical?.meaning?.english ||
    kanjiInfo.jishoData?.radical?.meaning ||
    baseEntry?.meaning ||
    "";

  return (
    <Paper
      elevation={0}
      className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <Typography variant="subtitle1" fontWeight={600}>
            Bộ thủ liên quan
          </Typography>
          <Typography variant="caption" className="text-[var(--app-muted)]">
            Gợi ý các bộ thủ liên quan và biến thể ký tự
          </Typography>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-[var(--app-surface-2)] dark:text-[var(--app-fg-muted)]">
          <InfoOutlinedIcon fontSize="small" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[120px_1fr]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
          <div className="text-4xl font-semibold">{baseRadicalChar || "?"}</div>
          <div className="mt-2 text-xs text-[var(--app-muted)]">
            {baseEntry?.readingJapanese || kanjiInfo.kanjialiveData?.radical?.name?.hiragana || ""}
          </div>
        </div>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
              <Typography variant="caption" className="text-[var(--app-muted)]">
                Nghĩa bộ thủ
              </Typography>
              <Typography variant="subtitle2" fontWeight={600}>
                {translate(radicalMeaning) ?? radicalMeaning ?? "Chưa có"}
              </Typography>
            </div>
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
              <Typography variant="caption" className="text-[var(--app-muted)]">
                Số nét
              </Typography>
              <Typography variant="subtitle2" fontWeight={600}>
                {kanjiInfo.kanjialiveData?.radical?.strokes ?? baseEntry?.strokes ?? "--"}
              </Typography>
            </div>
          </div>

          {alternatives.length > 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-bg)] p-3">
              <Typography variant="caption" className="text-[var(--app-muted)]">
                Biến thể liên quan
              </Typography>
              <div className="mt-2 flex flex-wrap gap-2">
                {alternatives.map((alt) => (
                  <div
                    key={`${alt.char}-${alt.posName ?? "base"}`}
                    className="flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm dark:bg-[#161D2A] dark:text-[#E5E7EB]"
                  >
                    <span>{alt.char}</span>
                    {alt.posName && (
                      <Image
                        alt={alt.posName}
                        src={`/radical-positions/${alt.posName}.svg`}
                        width={16}
                        height={16}
                        className="h-4 w-4 opacity-70"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-bg)] p-3">
              <Typography variant="caption" className="text-[var(--app-muted)]">
                Chưa có biến thể liên quan.
              </Typography>
            </div>
          )}
        </div>
      </div>
    </Paper>
  );
}
