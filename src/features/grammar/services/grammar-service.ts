import {
  grammarLevelsResponseSchema,
  grammarPointsResponseSchema,
  grammarStatsResponseSchema,
} from "@/features/grammar/types/schema";
import { getBaseUrl } from "@/lib/env";
import { fetchJson } from "@/lib/fetcher";

export const getGrammarLevels = async () => {
  const response = await fetchJson<unknown>(`${getBaseUrl()}/api/grammar/levels`, {
    cache: "no-store",
  });
  return grammarLevelsResponseSchema.parse(response).data;
};

export const getGrammarStats = async () => {
  const response = await fetchJson<unknown>(`${getBaseUrl()}/api/grammar/stats`, {
    cache: "no-store",
  });
  return grammarStatsResponseSchema.parse(response).data;
};

export const getGrammarPoints = async (levelId?: string) => {
  const url = new URL(`${getBaseUrl()}/api/grammar/points`);
  if (levelId) {
    url.searchParams.set("levelId", levelId);
  }

  const response = await fetchJson<unknown>(url.toString(), {
    cache: "no-store",
  });
  return grammarPointsResponseSchema.parse(response).data;
};
