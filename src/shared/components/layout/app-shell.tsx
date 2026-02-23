"use client";

import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { usePathname } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

import Sidebar from "@/shared/components/layout/sidebar";
import { useLayoutStore } from "@/shared/stores/layout-store";
import { cn } from "@/shared/utils/cn";

const getCurrentSection = (
  pathname: string,
): "grammar" | "vocabulary" | "practice" | "courses" | "kanji" => {
  if (pathname.startsWith("/vocabulary")) {
    return "vocabulary";
  }
  if (pathname.startsWith("/practice")) {
    return "practice";
  }
  if (pathname.startsWith("/courses")) {
    return "courses";
  }
  if (pathname.startsWith("/kanji-map")) {
    return "kanji";
  }
  return "grammar";
};

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const current = getCurrentSection(pathname);
  const isChatView = pathname.startsWith("/practice/chat");
  const { sidebarOpen, setSidebarOpen, immersiveMode } = useLayoutStore(
    useShallow((state) => ({
      sidebarOpen: state.sidebarOpen,
      setSidebarOpen: state.setSidebarOpen,
      immersiveMode: state.immersiveMode,
    })),
  );

  return (
    <Box className="flex h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--app-fg)]">
      {!immersiveMode && (
        <Box className="hidden h-full w-[280px] border-r border-[var(--app-border)] bg-white/70 backdrop-blur dark:bg-slate-950/40 lg:block">
          <Sidebar current={current} />
        </Box>
      )}

      {!immersiveMode && (
        <Drawer
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          PaperProps={{
            className: "h-full w-[280px] bg-white dark:bg-slate-950",
          }}
        >
          <Sidebar current={current} />
        </Drawer>
      )}

      <Box className="flex flex-1 flex-col overflow-hidden">
        {!immersiveMode && (
          <Stack
            direction="row"
            alignItems="center"
            className={cn(
              "bg-[var(--app-bg)]/80 border-b border-[var(--app-border)] px-6 py-4 backdrop-blur lg:hidden",
            )}
          >
            <IconButton onClick={() => setSidebarOpen(true)}>
              <MenuIcon />
            </IconButton>
            <span className="text-sm font-semibold text-slate-600">MiraiGo</span>
          </Stack>
        )}
        <main
          className={cn(
            "no-scrollbar flex min-h-0 flex-1 flex-col",
            immersiveMode ? "px-4 py-6 lg:px-8" : "px-6 py-8 lg:px-10",
            isChatView ? "overflow-hidden" : "overflow-y-auto",
          )}
        >
          {children}
        </main>
      </Box>
    </Box>
  );
}
