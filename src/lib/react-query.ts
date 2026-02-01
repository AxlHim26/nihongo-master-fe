import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

export const getQueryClient = cache(() => createQueryClient());
