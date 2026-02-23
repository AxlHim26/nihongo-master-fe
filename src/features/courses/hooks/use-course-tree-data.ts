"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { sampleCourseTree } from "@/features/courses/data/sample-course-tree";
import { getCourseTree } from "@/features/courses/services/course-tree-service";
import type { CourseTree } from "@/features/courses/types/course-tree";
import { courseQueryKeys } from "@/features/courses/utils/query-keys";
import { ApiError } from "@/lib/fetcher";

export const useCourseTreeData = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: courseQueryKeys.tree(),
    queryFn: getCourseTree,
  });

  const apiCourses = React.useMemo(() => data ?? [], [data]);
  const unauthorized = error instanceof ApiError && (error.status === 401 || error.status === 403);
  const usingSampleData = !isLoading && !unauthorized && apiCourses.length === 0;
  const courses = React.useMemo<CourseTree[]>(
    () => (usingSampleData ? sampleCourseTree : apiCourses),
    [apiCourses, usingSampleData],
  );

  return {
    courses,
    isLoading,
    isError,
    error,
    unauthorized,
    usingSampleData,
  };
};
