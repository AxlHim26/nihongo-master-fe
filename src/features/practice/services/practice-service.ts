import { conversationListResponseSchema } from "@/features/practice/types/schema";
import { getBaseUrl } from "@/lib/env";
import { fetchJson } from "@/lib/fetcher";

export const getConversations = async () => {
  const response = await fetchJson<unknown>(`${getBaseUrl()}/api/practice/conversations`, {
    cache: "no-store",
  });
  return conversationListResponseSchema.parse(response).data;
};
