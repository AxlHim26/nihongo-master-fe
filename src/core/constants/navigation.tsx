import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import GridViewIcon from "@mui/icons-material/GridView";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import MapIcon from "@mui/icons-material/Map";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PsychologyIcon from "@mui/icons-material/Psychology";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import SchoolIcon from "@mui/icons-material/School";
import SearchIcon from "@mui/icons-material/Search";

import { grammarLevels } from "@/core/data/grammar";
import type { NavSection, TopTab } from "@/shared/types/navigation";

export const topTabs: TopTab[] = [
  {
    id: "vocabulary",
    label: "Từ Vựng",
    href: "/vocabulary",
    icon: <LibraryBooksIcon fontSize="small" />,
  },
  {
    id: "grammar",
    label: "Ngữ Pháp",
    href: "/grammar",
    icon: <MenuBookIcon fontSize="small" />,
  },
  {
    id: "kanji-map",
    label: "Hán Tự",
    href: "/kanji-map",
    icon: <MapIcon fontSize="small" />,
  },
  {
    id: "courses",
    label: "Khoá Học",
    href: "/courses",
    icon: <SchoolIcon fontSize="small" />,
  },
  {
    id: "practice",
    label: "Luyện Tập",
    href: "/practice/chat",
    icon: <AutoAwesomeIcon fontSize="small" />,
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
    id: "vocabulary-library",
    title: "Kho từ vựng",
    items: [
      {
        id: "vocabulary-n5",
        label: "Từ vựng N5",
        variant: "plain",
      },
      {
        id: "vocabulary-n4",
        label: "Từ vựng N4",
        variant: "plain",
      },
      {
        id: "vocabulary-n3",
        label: "Từ vựng N3",
        variant: "plain",
      },
      {
        id: "vocabulary-n2",
        label: "Từ vựng N2",
        variant: "plain",
      },
      {
        id: "vocabulary-n1",
        label: "Từ vựng N1",
        variant: "plain",
      },
      {
        id: "vocabulary-specialized",
        label: "Từ vựng chuyên ngành",
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
        id: "practice-reading",
        label: "Luyện đọc",
        href: "/practice/reading",
        icon: <MenuBookIcon fontSize="small" />,
      },
      {
        id: "practice-listening",
        label: "Luyện nghe",
        href: "/practice/listening",
        icon: <GraphicEqIcon fontSize="small" />,
      },
      {
        id: "practice-shadowing",
        label: "Shadowing",
        href: "/practice/shadowing",
        icon: <RecordVoiceOverIcon fontSize="small" />,
      },
      {
        id: "jlpt",
        label: "Luyện thi JLPT",
        href: "/practice/jlpt",
        icon: <AutoAwesomeIcon fontSize="small" />,
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
        icon: <GridViewIcon fontSize="small" />,
      },
      {
        id: "search",
        label: "Tìm kiếm",
        icon: <SearchIcon fontSize="small" />,
        badge: "Ctrl + K",
      },
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
        icon: <GridViewIcon fontSize="small" />,
      },
      {
        id: "search",
        label: "Tìm kiếm",
        icon: <SearchIcon fontSize="small" />,
        badge: "Ctrl + K",
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
    id: "kanji-library",
    title: "Kho hán tự",
    items: [
      {
        id: "kanji-n5",
        label: "Hán tự N5",
        variant: "plain",
      },
      {
        id: "kanji-n4",
        label: "Hán tự N4",
        variant: "plain",
      },
      {
        id: "kanji-n3",
        label: "Hán tự N3",
        variant: "plain",
      },
      {
        id: "kanji-n2",
        label: "Hán tự N2",
        variant: "plain",
      },
      {
        id: "kanji-n1",
        label: "Hán tự N1",
        variant: "plain",
      },
    ],
  },
];
