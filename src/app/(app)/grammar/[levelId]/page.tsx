import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import GrammarLevelDetail from "@/features/grammar/components/grammar-level-detail";
import { getGrammarPoints } from "@/features/grammar/services/grammar-service";
import { grammarQueryKeys } from "@/features/grammar/utils/query-keys";
import { getQueryClient } from "@/lib/react-query";

export const metadata: Metadata = {
  title: "Chi tiết ngữ pháp",
};

type GrammarLevelPageProps = {
  params: { levelId: string };
};

export default async function GrammarLevelPage({ params }: GrammarLevelPageProps) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: grammarQueryKeys.points(params.levelId),
    queryFn: () => getGrammarPoints(params.levelId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GrammarLevelDetail levelId={params.levelId} />
    </HydrationBoundary>
  );
}
