import { z } from "zod";

export const conversationMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  createdAt: z.string(),
  emotion: z.enum(["happy", "sad", "surprised", "caring", "shy", "confused", "neutral"]).optional(),
});

export const conversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
  messages: z.array(conversationMessageSchema),
});

export const conversationListResponseSchema = z.object({
  data: z.array(conversationSchema),
});
