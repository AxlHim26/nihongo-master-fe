import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BarChartIcon from "@mui/icons-material/BarChart";
import GridViewIcon from "@mui/icons-material/GridView";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import MapIcon from "@mui/icons-material/Map";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PsychologyIcon from "@mui/icons-material/Psychology";
import PublicIcon from "@mui/icons-material/Public";
import SchoolIcon from "@mui/icons-material/School";
import SearchIcon from "@mui/icons-material/Search";
import TimerIcon from "@mui/icons-material/Timer";

import { grammarLevels } from "@/core/data/grammar";
import type { NavSection, TopTab } from "@/shared/types/navigation";

export const topTabs: TopTab[] = [
  {
    id: "grammar",
    label: "Ngữ pháp",
    href: "/grammar",
    icon: <MenuBookIcon fontSize="small" />,
  },
  {
    id: "vocabulary",
    label: "Từ vựng",
    href: "/vocabulary",
    icon: <LibraryBooksIcon fontSize="small" />,
  },
  {
    id: "practice",
    label: "Luyện tập",
    href: "/practice/chat",
    icon: <AutoAwesomeIcon fontSize="small" />,
  },
  {
    id: "courses",
    label: "Khóa học",
    href: "/courses",
    icon: <SchoolIcon fontSize="small" />,
  },
  {
    id: "kanji-map",
    label: "Kanji map",
    href: "/kanji-map",
    icon: <MapIcon fontSize="small" />,
  },
];

export const grammarSidebarSections: NavSection[] = [
  {
    id: "overview",
    items: [
      {
        id: "home",
        label: "Trang chủ",
        href: "/grammar",
        icon: <GridViewIcon fontSize="small" />,
      },
      {
        id: "search",
        label: "Tìm kiếm",
        icon: <SearchIcon fontSize="small" />,
        badge: "(Ctrl + K)",
        variant: "plain",
      },
    ],
  },
  {
    id: "courses",
    title: "Giáo trình",
    items: grammarLevels.map((level) => ({
      id: level.id,
      label: level.title,
      href: `/grammar/${level.id}`,
      variant: "plain",
    })),
  },
];

export const vocabularySidebarSections: NavSection[] = [
  {
    id: "overview",
    items: [
      {
        id: "home",
        label: "Trang chủ",
        href: "/vocabulary",
        icon: <GridViewIcon fontSize="small" />,
      },
      {
        id: "search",
        label: "Tìm kiếm",
        icon: <SearchIcon fontSize="small" />,
        badge: "(Ctrl + K)",
        variant: "plain",
      },
      {
        id: "review",
        label: "Cần ôn tập",
        icon: <PsychologyIcon fontSize="small" />,
        variant: "plain",
      },
    ],
  },
  {
    id: "recent",
    title: "GẦN ĐÂY",
    meta: "0/5",
    items: [
      {
        id: "create-set",
        label: "Tạo bộ từ mới",
        icon: <LayersOutlinedIcon fontSize="small" />,
        variant: "dashed",
      },
    ],
  },
  {
    id: "community",
    title: "Khóa học cộng đồng (146)",
    icon: <PublicIcon fontSize="inherit" />,
    titleStyle: "normal",
    items: [
      {
        id: "lesson-12",
        label: "Bài 12",
        badge: "(Mới)",
        icon: <BarChartIcon fontSize="inherit" />,
        variant: "plain",
      },
      {
        id: "lesson-11",
        label: "Bài 11",
        badge: "(Mới)",
        icon: <BarChartIcon fontSize="inherit" />,
        variant: "plain",
      },
      {
        id: "lesson-10",
        label: "Bài 10",
        badge: "(Mới)",
        icon: <BarChartIcon fontSize="inherit" />,
        variant: "plain",
      },
      {
        id: "lesson-9",
        label: "Bài 9",
        badge: "(Mới)",
        icon: <BarChartIcon fontSize="inherit" />,
        variant: "plain",
      },
      {
        id: "lesson-8",
        label: "Bài 8",
        badge: "(Mới)",
        icon: <BarChartIcon fontSize="inherit" />,
        variant: "plain",
      },
    ],
  },
];

export const practiceSidebarSections: NavSection[] = [
  {
    id: "practice",
    title: "Khu vực luyện tập",
    items: [
      {
        id: "chat",
        label: "Trò chuyện AI",
        href: "/practice/chat",
        icon: <AutoAwesomeIcon fontSize="small" />,
      },
      {
        id: "challenge",
        label: "Thử thách 50 ngày",
        href: "/practice/challenge",
        icon: <TimerIcon fontSize="small" />,
      },
      {
        id: "jlpt",
        label: "Luyện thi JLPT",
        icon: <AutoAwesomeIcon fontSize="small" />,
        disabled: true,
      },
    ],
  },
];

export const coursesSidebarSections: NavSection[] = [
  {
    id: "overview",
    items: [
      {
        id: "home",
        label: "Trang chủ",
        href: "/courses",
        icon: <SchoolIcon fontSize="small" />,
      },
      {
        id: "search",
        label: "Tìm kiếm",
        icon: <SearchIcon fontSize="small" />,
        badge: "Ctrl + K",
      },
    ],
  },
  {
    id: "tracks",
    title: "Lộ trình",
    items: [
      { id: "foundation", label: "Nền tảng N5", href: "/courses?track=foundation" },
      { id: "intermediate", label: "Nâng cao N3", href: "/courses?track=intermediate" },
      { id: "advanced", label: "N1 tăng tốc", href: "/courses?track=advanced" },
    ],
  },
];

export const kanjiSidebarSections: NavSection[] = [
  {
    id: "overview",
    items: [
      {
        id: "home",
        label: "Trang chủ",
        href: "/kanji-map",
        icon: <MapIcon fontSize="small" />,
      },
      {
        id: "search",
        label: "Tìm kiếm",
        icon: <SearchIcon fontSize="small" />,
        badge: "Ctrl + K",
      },
    ],
  },
  {
    id: "levels",
    title: "Cấp độ JLPT",
    items: [
      { id: "jlpt-n5", label: "N5", href: "/kanji-map?level=n5" },
      { id: "jlpt-n4", label: "N4", href: "/kanji-map?level=n4" },
      { id: "jlpt-n3", label: "N3", href: "/kanji-map?level=n3" },
      { id: "jlpt-n2", label: "N2", href: "/kanji-map?level=n2" },
      { id: "jlpt-n1", label: "N1", href: "/kanji-map?level=n1" },
    ],
  },
];
