import type { ReactNode } from "react";

export type NavItem = {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: string;
  disabled?: boolean;
  actionLabel?: string;
  variant?: "dashed" | "plain";
};

export type NavSection = {
  id: string;
  title?: string;
  items: NavItem[];
  meta?: string;
  icon?: ReactNode;
  titleStyle?: "upper" | "normal";
};

export type TopTab = {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
};
