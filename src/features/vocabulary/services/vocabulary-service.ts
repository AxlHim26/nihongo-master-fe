import {
  vocabularyCommunityResponseSchema,
  vocabularyLibraryResponseSchema,
} from "@/features/vocabulary/types/schema";
import { getBaseUrl } from "@/lib/env";
import { fetchJson } from "@/lib/fetcher";

export const getVocabularyLibrary = async () => {
  const response = await fetchJson<unknown>(`${getBaseUrl()}/api/vocabulary/library`, {
    cache: "no-store",
  });
  return vocabularyLibraryResponseSchema.parse(response).data;
};

export const getVocabularyCommunity = async () => {
  const response = await fetchJson<unknown>(`${getBaseUrl()}/api/vocabulary/community`, {
    cache: "no-store",
  });
  return vocabularyCommunityResponseSchema.parse(response).data;
};
