"use client";

import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";

import compositionMap from "@/features/kanji/data/composition.json";
import radicallist from "@/features/kanji/data/radicallist.json";
import type { KanjiInfo } from "@/features/kanji/types/kanji-info";
import { cn } from "@/shared/utils/cn";

type RadicalEntry = {
  radical: string;
  alternatives?: string[];
  meaning?: string;
};

type Node = { id: string; label: string };

type Link = { source: string; target: string };

type RadicalRelationMapProps = {
  kanjiInfo: KanjiInfo | null;
};

const RADICAL_SET = new Set((radicallist as RadicalEntry[]).map((entry) => entry.radical));

const buildAltIndex = () => {
  const baseByAlt = new Map<string, string>();
  const entryByRadical = new Map<string, RadicalEntry>();

  (radicallist as RadicalEntry[]).forEach((entry) => {
    entryByRadical.set(entry.radical, entry);
    (entry.alternatives ?? []).forEach((alt) => {
      if (!baseByAlt.has(alt)) baseByAlt.set(alt, entry.radical);
    });
  });

  return { baseByAlt, entryByRadical };
};

const { baseByAlt, entryByRadical } = buildAltIndex();

const getBaseRadical = (kanjiInfo: KanjiInfo | null) => {
  return (
    kanjiInfo?.kanjialiveData?.radical?.character?.trim() ||
    kanjiInfo?.jishoData?.radical?.symbol?.trim() ||
    ""
  );
};

const getComposition = (radical: string) => {
  const entry = (compositionMap as Record<string, { in: string[]; out: string[] }>)[radical];
  return {
    in: entry?.in ?? [],
    out: entry?.out ?? [],
  };
};

const getRelatedRadicals = (center: string) => {
  if (!center) return [] as string[];

  const base = baseByAlt.get(center) ?? center;
  const baseEntry = entryByRadical.get(base);
  const altSet = new Set<string>(baseEntry?.alternatives ?? []);

  const composition = getComposition(base);
  const related = new Set<string>();

  [...composition.in, ...composition.out].forEach((item) => {
    if (RADICAL_SET.has(item)) related.add(item);
  });

  altSet.forEach((alt) => related.add(alt));

  related.delete(center);
  related.delete(base);

  return Array.from(related).slice(0, 8);
};

const buildGraph = (center: string) => {
  const related = getRelatedRadicals(center);
  const nodes: Node[] = [
    { id: center, label: center },
    ...related.map((r) => ({ id: r, label: r })),
  ];

  const linkSet = new Set<string>();
  const links: Link[] = [];

  related.forEach((node) => {
    const key = `${center}->${node}`;
    if (!linkSet.has(key)) {
      linkSet.add(key);
      links.push({ source: center, target: node });
    }
  });

  related.forEach((source, index) => {
    const { in: inRelations, out: outRelations } = getComposition(source);
    const relatedSet = new Set(related);

    [...inRelations, ...outRelations].forEach((target) => {
      if (!relatedSet.has(target)) return;
      const key = `${source}->${target}`;
      if (!linkSet.has(key)) {
        linkSet.add(key);
        links.push({ source, target });
      }
    });

    // fallback link between neighbors to ensure visible network
    const next = related[(index + 1) % related.length];
    if (next) {
      const key = `${source}~${next}`;
      if (!linkSet.has(key)) {
        linkSet.add(key);
        links.push({ source, target: next });
      }
    }
  });

  return { nodes, links };
};

export default function RadicalRelationMap({ kanjiInfo }: RadicalRelationMapProps) {
  const initial = getBaseRadical(kanjiInfo);
  const [centerRadical, setCenterRadical] = useState(initial);

  const { nodes, links } = useMemo(() => buildGraph(centerRadical), [centerRadical]);

  const layout = useMemo(() => {
    const center = { x: 210, y: 130 };
    const positions = new Map<string, { x: number; y: number }>();
    positions.set(centerRadical, center);

    const orbitals = nodes.filter((node) => node.id !== centerRadical);
    const radius = orbitals.length > 4 ? 98 : 86;

    orbitals.forEach((node, index) => {
      const angle = (Math.PI * 2 * index) / orbitals.length;
      positions.set(node.id, {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
      });
    });

    return { positions, center };
  }, [nodes, centerRadical]);

  if (!centerRadical) return null;

  const relatedCount = nodes.length - 1;

  return (
    <Paper
      elevation={0}
      className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="subtitle1" fontWeight={600}>
            Map bộ thủ liên quan
          </Typography>
          <Typography variant="caption" className="text-[var(--app-muted)]">
            Chạm vào bộ thủ để mở map mới · {relatedCount} liên kết
          </Typography>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-4">
        <svg viewBox="0 0 420 260" className="h-[260px] w-full max-w-[520px]">
          {links.map((link) => {
            const source = layout.positions.get(link.source);
            const target = layout.positions.get(link.target);
            if (!source || !target) return null;
            return (
              <line
                key={`${link.source}-${link.target}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="#c7d2fe"
                strokeWidth="1.8"
                opacity={0.9}
              />
            );
          })}

          {nodes.map((node) => {
            const position = layout.positions.get(node.id);
            if (!position) return null;
            const isCenter = node.id === centerRadical;
            return (
              <g key={node.id}>
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={isCenter ? 28 : 22}
                  className={cn(
                    "cursor-pointer fill-[#bfdbfe]",
                    isCenter ? "stroke-[#2563eb]" : "stroke-[#93c5fd]",
                  )}
                  strokeWidth={isCenter ? 3 : 2}
                  onClick={() => setCenterRadical(node.id)}
                />
                <text
                  x={position.x}
                  y={position.y + 6}
                  textAnchor="middle"
                  className="select-none fill-slate-800 text-[18px] font-semibold"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Paper>
  );
}
