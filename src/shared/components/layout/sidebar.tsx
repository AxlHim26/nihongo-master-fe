"use client";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PersonIcon from "@mui/icons-material/Person";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { usePathname } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

import {
  coursesSidebarSections,
  grammarSidebarSections,
  kanjiSidebarSections,
  practiceSidebarSections,
  topTabs,
  vocabularySidebarSections,
} from "@/core/constants/navigation";
import SidebarSection from "@/shared/components/layout/sidebar-section";
import TopTabs from "@/shared/components/layout/top-tabs";
import ThemeToggle from "@/shared/components/theme/theme-toggle";
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
  const { setCommandOpen, setSidebarOpen } = useLayoutStore(
    useShallow((state) => ({
      setCommandOpen: state.setCommandOpen,
      setSidebarOpen: state.setSidebarOpen,
    })),
  );

  const sections = sectionMap[current];

  const handleItemClick = (id: string) => {
    if (id === "search") {
      setCommandOpen(true);
    }
    if (id === "create-set") {
      setSidebarOpen(false);
    }
  };

  const activeHref = pathname;

  return (
    <Box className="flex h-full flex-col gap-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 text-sm font-semibold text-white shadow-sm">
          J
        </div>
        <div>
          <Typography variant="subtitle1" fontWeight={700}>
            Japience
          </Typography>
        </div>
      </div>

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
            <div className="text-xs">
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                dxuantien5@gmail.com
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Free Plan</span>
                <Chip size="small" label="0/10" />
              </div>
            </div>
          </div>
          <IconButton size="small">
            <AutoAwesomeIcon fontSize="inherit" />
          </IconButton>
        </div>
      </div>
    </Box>
  );
}
