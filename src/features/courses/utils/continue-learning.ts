export const CONTINUE_LEARNING_STORAGE_KEY = "courses-continue-learning";

export type ContinueLearningPayload = {
  path: string;
  courseId: number;
  chapterId: number;
  sectionType: string;
  lessonId: number;
  updatedAt: string;
};

export const saveContinueLearning = (payload: ContinueLearningPayload) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(CONTINUE_LEARNING_STORAGE_KEY, JSON.stringify(payload));
};

export const getContinueLearningPath = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(CONTINUE_LEARNING_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ContinueLearningPayload>;
    const path = parsed.path?.trim();
    if (!path) {
      return null;
    }
    return path.startsWith("/") ? path : `/${path}`;
  } catch {
    return null;
  }
};
