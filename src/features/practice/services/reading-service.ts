import type { ProficiencyLevel } from "@/features/practice/types/agent";
import {
  readingAnnotationResponseSchema,
  readingExerciseSchema,
  readingWordExplanationSchema,
} from "@/features/practice/types/reading";
import { fetchJson } from "@/lib/fetcher";

export const generateReadingExercise = async (proficiencyLevel: ProficiencyLevel) => {
  const response = await fetchJson<unknown>("/api/practice/reading/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ proficiencyLevel }),
  });

  return readingExerciseSchema.parse(response);
};

export const annotateReadingLines = async (lines: string[]) => {
  const response = await fetchJson<unknown>("/api/practice/reading/annotate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lines }),
  });

  return readingAnnotationResponseSchema.parse(response).items;
};

export const explainReadingWord = async (word: string, context: string) => {
  const response = await fetchJson<unknown>("/api/practice/reading/word", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ word, context }),
  });

  return readingWordExplanationSchema.parse(response);
};
