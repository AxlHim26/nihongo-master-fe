"use client";

import BookIcon from "@mui/icons-material/Book";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { getGrammarLevels } from "@/features/grammar/services/grammar-service";
import { grammarQueryKeys } from "@/features/grammar/utils/query-keys";
import SectionCard from "@/shared/components/ui/section-card";

export default function GrammarLevelList() {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: grammarQueryKeys.levels(),
    queryFn: getGrammarLevels,
  });

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={600}>
        Danh sách trình độ
      </Typography>
      {isLoading || !data
        ? Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={80} />
          ))
        : data.map((level) => (
            <SectionCard
              key={level.id}
              title={level.title}
              description={level.source}
              onClick={() => router.push(`/grammar/${level.id}`)}
              meta={
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <BookIcon fontSize="inherit" /> {level.lessonCount} bài học
                  </span>
                  <span className="flex items-center gap-1">
                    <MenuBookIcon fontSize="inherit" /> {level.grammarCount} ngữ pháp
                  </span>
                </div>
              }
            />
          ))}
      {isError && (
        <Typography variant="body2" color="text.secondary">
          Không thể tải danh sách trình độ. Vui lòng thử lại.
        </Typography>
      )}
    </Stack>
  );
}
