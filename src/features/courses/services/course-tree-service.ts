import type { CourseTree } from "@/features/courses/types/course-tree";
import { api } from "@/lib/api-client";

type ApiEnvelope<T> = {
  status: number;
  message: string;
  data: T;
  errorCode?: string;
  path?: string;
  timestamp?: string;
};

export const getCourseTree = async () => {
  const response = await api.get<ApiEnvelope<CourseTree[]>>("/api/v1/courses", {
    params: {
      tree: true,
    },
  });

  return response.data.data;
};
