import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60_000,
        gcTime: 30 * 60_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        retry: 1,
      },
    },
  });

export const getQueryClient = cache(() => createQueryClient());
