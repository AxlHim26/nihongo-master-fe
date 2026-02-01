import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import GrammarOverview from "@/features/grammar/components/grammar-overview";
import { getGrammarLevels, getGrammarStats } from "@/features/grammar/services/grammar-service";
import { grammarQueryKeys } from "@/features/grammar/utils/query-keys";
import { getQueryClient } from "@/lib/react-query";

export const metadata: Metadata = {
  title: "Ngữ pháp",
  description: "Khám phá và học ngữ pháp tiếng Nhật",
};

export default async function GrammarPage() {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: grammarQueryKeys.stats(),
      queryFn: getGrammarStats,
    }),
    queryClient.prefetchQuery({
      queryKey: grammarQueryKeys.levels(),
      queryFn: getGrammarLevels,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GrammarOverview />
    </HydrationBoundary>
  );
}
