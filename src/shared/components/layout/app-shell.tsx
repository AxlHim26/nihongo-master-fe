"use client";

import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { usePathname } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

import Sidebar from "@/shared/components/layout/sidebar";
import BrandLogo from "@/shared/components/ui/brand-logo";
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
        <Box className="app-sidebar hidden h-full w-[280px] lg:block">
          <Sidebar current={current} />
        </Box>
      )}

      {!immersiveMode && (
        <Drawer
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          PaperProps={{
            className: "app-sidebar h-full w-[min(84vw,280px)]",
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
            className={cn("app-navbar px-4 py-3 lg:hidden")}
          >
            <IconButton onClick={() => setSidebarOpen(true)}>
              <MenuIcon />
            </IconButton>
            <BrandLogo className="ml-1" />
          </Stack>
        )}
        <main
          className={cn(
            "no-scrollbar flex min-h-0 flex-1 flex-col",
            immersiveMode
              ? "px-3 py-4 sm:px-4 sm:py-5 lg:px-8"
              : "px-3 py-4 sm:px-4 sm:py-5 lg:px-10 lg:py-8",
            isChatView ? "overflow-hidden" : "overflow-y-auto",
          )}
        >
          {children}
        </main>
      </Box>
    </Box>
  );
}
