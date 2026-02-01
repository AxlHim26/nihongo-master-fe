"use client";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { QueryClientProvider } from "@tanstack/react-query";
import { useServerInsertedHTML } from "next/navigation";
import * as React from "react";
import { useShallow } from "zustand/react/shallow";

import { createAppTheme } from "@/core/theme/create-theme";
import { createQueryClient } from "@/lib/react-query";
import { useThemeStore } from "@/shared/stores/theme-store";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  const { mode, hasHydrated } = useThemeStore(
    useShallow((state) => ({
      mode: state.mode,
      hasHydrated: state.hasHydrated,
    })),
  );
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)", {
    noSsr: true,
  });

  const resolvedMode = hasHydrated
    ? mode === "system"
      ? prefersDarkMode
        ? "dark"
        : "light"
      : mode
    : "light";

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedMode === "dark");
    root.dataset["theme"] = resolvedMode;
  }, [resolvedMode]);

  const theme = React.useMemo(() => createAppTheme(resolvedMode), [resolvedMode]);
  const [queryClient] = React.useState(() => createQueryClient());

  const [{ cache, flush }] = React.useState(() => {
    const cache = createCache({ key: "mui", prepend: true });
    cache.compat = true;

    let inserted: string[] = [];
    const prevInsert = cache.insert;
    cache.insert = (...args: Parameters<typeof prevInsert>) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };

    const flush = () => {
      const prev = inserted;
      inserted = [];
      return prev;
    };

    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }

    let styles = "";
    names.forEach((name) => {
      styles += cache.inserted[name];
    });

    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
