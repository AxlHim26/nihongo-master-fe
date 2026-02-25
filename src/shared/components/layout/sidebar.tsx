"use client";

import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonIcon from "@mui/icons-material/Person";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { useShallow } from "zustand/react/shallow";

import {
  coursesSidebarSections,
  grammarSidebarSections,
  kanjiSidebarSections,
  practiceSidebarSections,
  topTabs,
  vocabularySidebarSections,
} from "@/core/constants/navigation";
import { logout } from "@/features/auth/services/auth-api";
import { authStorage } from "@/features/auth/utils/auth-storage";
import SidebarSection from "@/shared/components/layout/sidebar-section";
import TopTabs from "@/shared/components/layout/top-tabs";
import ThemeToggle from "@/shared/components/theme/theme-toggle";
import BrandLogo from "@/shared/components/ui/brand-logo";
import { useLayoutStore } from "@/shared/stores/layout-store";

const sectionMap = {
  grammar: grammarSidebarSections,
  vocabulary: vocabularySidebarSections,
  practice: practiceSidebarSections,
  courses: coursesSidebarSections,
  kanji: kanjiSidebarSections,
};

type SidebarProps = {
  current: "grammar" | "vocabulary" | "practice" | "courses" | "kanji";
};

export default function Sidebar({ current }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setCommandOpen, setSidebarOpen } = useLayoutStore(
    useShallow((state) => ({
      setCommandOpen: state.setCommandOpen,
      setSidebarOpen: state.setSidebarOpen,
    })),
  );

  const sections = React.useMemo(() => sectionMap[current], [current]);
  const [logoutPending, setLogoutPending] = React.useState(false);

  const handleItemClick = React.useCallback(
    (id: string) => {
      if (id === "search") {
        setCommandOpen(true);
      }
      if (id === "create-set") {
        setSidebarOpen(false);
      }
    },
    [setCommandOpen, setSidebarOpen],
  );

  const activeHref = pathname;
  const email = authStorage.getEmail() ?? authStorage.getUsername() ?? "";

  const handleLogout = React.useCallback(async () => {
    if (logoutPending) {
      return;
    }

    setLogoutPending(true);
    try {
      await logout();
    } catch {
      // Even if server logout fails, clear local session and move user to login.
    } finally {
      authStorage.clearSession();
      setSidebarOpen(false);
      router.replace("/login");
      setLogoutPending(false);
    }
  }, [logoutPending, router, setSidebarOpen]);

  return (
    <Box className="flex h-full flex-col gap-6 px-4 py-6">
      <BrandLogo />

      <TopTabs tabs={topTabs} />

      <div className="no-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto pr-1">
        {sections.map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            activeId={activeHref}
            onItemClick={handleItemClick}
          />
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Typography variant="caption" color="text.secondary">
            Giao diện
          </Typography>
          <ThemeToggle />
        </div>
        <Divider />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <PersonIcon fontSize="small" />
            </div>
            <div className="text-xs font-semibold text-slate-700 dark:text-[#E5E7EB]">{email}</div>
          </div>
          <IconButton
            size="small"
            onClick={handleLogout}
            aria-label="Đăng xuất"
            disabled={logoutPending}
          >
            <LogoutRoundedIcon fontSize="inherit" />
          </IconButton>
        </div>
      </div>
    </Box>
  );
}
