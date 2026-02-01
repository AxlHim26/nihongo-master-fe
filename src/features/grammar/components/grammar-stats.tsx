"use client";

import LayersIcon from "@mui/icons-material/Layers";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { useQuery } from "@tanstack/react-query";

import { getGrammarStats } from "@/features/grammar/services/grammar-service";
import { grammarQueryKeys } from "@/features/grammar/utils/query-keys";
import StatCard from "@/shared/components/ui/stat-card";

export default function GrammarStats() {
  const { data, isLoading, isError } = useQuery({
    queryKey: grammarQueryKeys.stats(),
    queryFn: getGrammarStats,
  });

  if (isError) {
    return (
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <StatCard icon={<LayersIcon />} label="Trình độ" value="--" tone="neutral" />
        <StatCard icon={<LocalLibraryIcon />} label="Bài học" value="--" />
        <StatCard icon={<MenuBookIcon />} label="Ngữ pháp" value="--" />
      </Stack>
    );
  }

  if (isLoading || !data) {
    return (
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} variant="rounded" height={88} className="flex-1" />
        ))}
      </Stack>
    );
  }

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <StatCard icon={<LayersIcon />} label="Trình độ" value={data.levelCount} tone="neutral" />
      <StatCard icon={<LocalLibraryIcon />} label="Bài học" value={data.lessonCount} />
      <StatCard icon={<MenuBookIcon />} label="Ngữ pháp" value={data.grammarCount} />
    </Stack>
  );
}
