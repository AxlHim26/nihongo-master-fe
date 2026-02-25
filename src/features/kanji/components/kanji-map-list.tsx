import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { kanjiClusters } from "@/core/data/kanji-map";
import SectionCard from "@/shared/components/ui/section-card";

export default function KanjiMapList() {
  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={600}>
        Lộ trình kanji
      </Typography>
      {kanjiClusters.map((cluster) => (
        <SectionCard
          key={cluster.id}
          title={cluster.title}
          description={cluster.description}
          meta={
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{cluster.kanjiCount} kanji</span>
                <span>{cluster.progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#212B3A]">
                <div
                  className="h-full rounded-full bg-blue-500 dark:bg-[var(--app-fg-muted)]"
                  style={{ width: `${cluster.progress}%` }}
                />
              </div>
            </div>
          }
        />
      ))}
    </Stack>
  );
}
