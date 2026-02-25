import * as React from "react";

import SidebarItem from "@/shared/components/layout/sidebar-item";
import type { NavSection } from "@/shared/types/navigation";
import { cn } from "@/shared/utils/cn";
type SidebarSectionProps = {
  section: NavSection;
  activeId?: string;
  onItemClick?: (id: string) => void;
};

function SidebarSection({ section, activeId, onItemClick }: SidebarSectionProps) {
  const titleStyle = section.titleStyle ?? "upper";
  const iconTone = titleStyle === "upper" ? "text-slate-400" : "text-slate-500";
  return (
    <div className="space-y-2">
      {section.title && (
        <div
          className={cn(
            "flex items-center justify-between px-3",
            titleStyle === "upper"
              ? "text-[11px] font-semibold uppercase tracking-wide text-slate-400"
              : "text-[12px] font-semibold text-slate-600",
          )}
        >
          <span className="flex items-center gap-2">
            {section.icon && <span className={iconTone}>{section.icon}</span>}
            <span>{section.title}</span>
          </span>
          {section.meta && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:border-[#3A4658] dark:bg-[#1A2231] dark:text-[#A7B0BC]">
              {section.meta}
            </span>
          )}
        </div>
      )}
      <div className="space-y-1">
        {section.items.map((item) => {
          const isActive = item.href ? activeId?.startsWith(item.href) : activeId === item.id;
          return (
            <SidebarItem
              key={item.id}
              item={item}
              active={Boolean(isActive)}
              {...(onItemClick ? { onClick: onItemClick } : {})}
            />
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(SidebarSection);
