import { z } from "zod";

import type { ProficiencyLevel } from "@/features/practice/types/agent";

export const readingLevelValues = ["N5", "N4", "N3", "N2", "N1"] as const;

export const readingLevelSchema = z.enum(readingLevelValues);

export type ReadingLevel = ProficiencyLevel;

export const readingQuestionOptionSchema = z.object({
  id: z.enum(["A", "B", "C", "D"]),
  text: z.string().min(1),
});

export const readingQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  options: z.array(readingQuestionOptionSchema).length(4),
  correctOptionId: z.enum(["A", "B", "C", "D"]),
  explanationVi: z.string().min(1),
  explanationJa: z.string().min(1),
});

export const readingExerciseSchema = z.object({
  id: z.string().min(1),
  level: readingLevelSchema,
  title: z.string().min(1),
  passageLines: z.array(z.string().min(1)).min(1),
  questions: z.array(readingQuestionSchema).length(5),
  createdAt: z.string().min(1),
});

export type ReadingExercise = z.infer<typeof readingExerciseSchema>;
export type ReadingQuestion = z.infer<typeof readingQuestionSchema>;
export type ReadingQuestionOption = z.infer<typeof readingQuestionOptionSchema>;

export const readingAnnotationItemSchema = z.object({
  line: z.string().min(1),
  romaji: z.string().min(1),
  translation: z.string().min(1),
});

export const readingAnnotationResponseSchema = z.object({
  items: z.array(readingAnnotationItemSchema),
});

export type ReadingAnnotationItem = z.infer<typeof readingAnnotationItemSchema>;

export const readingWordExplanationSchema = z.object({
  word: z.string().min(1),
  reading: z.string().min(1),
  meaningVi: z.string().min(1),
  exampleJa: z.string().min(1),
  exampleVi: z.string().min(1),
});

export type ReadingWordExplanation = z.infer<typeof readingWordExplanationSchema>;
