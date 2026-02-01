import { z } from "zod";

export const vocabularySetSchema = z.object({
  id: z.string(),
  title: z.string(),
  wordCount: z.number(),
  updatedAt: z.string(),
  isCommunity: z.boolean().optional(),
  isNew: z.boolean().optional(),
});

export const vocabularyLibrarySchema = z.object({
  sets: z.array(vocabularySetSchema),
  limit: z.number(),
});

export const vocabularyLibraryResponseSchema = z.object({
  data: vocabularyLibrarySchema,
});

export const vocabularyCommunityResponseSchema = z.object({
  data: z.array(vocabularySetSchema),
});
