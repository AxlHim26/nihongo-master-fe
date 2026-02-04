import Link from "next/link";
import * as React from "react";

import type { NavItem } from "@/shared/types/navigation";
import { cn } from "@/shared/utils/cn";

type SidebarItemProps = {
  item: NavItem;
  active?: boolean;
  onClick?: (id: string) => void;
};

function SidebarItem({ item, active, onClick }: SidebarItemProps) {
  const isDashed = item.variant === "dashed";
  const isPlain = item.variant === "plain";
  const showInlineBadge = isPlain && item.badge;
  const handleClick = React.useCallback(() => {
    onClick?.(item.id);
  }, [item.id, onClick]);
  const className = cn(
    "flex w-full appearance-none items-center justify-between rounded-xl border-0 bg-transparent px-3 py-2 text-sm font-medium transition",
    isPlain
      ? cn(
          "rounded-lg px-3 py-2 text-slate-500 hover:bg-transparent hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
          active && "text-slate-900 dark:text-white",
        )
      : isDashed
        ? "border border-dashed border-slate-200 bg-transparent text-slate-500 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-800"
        : active
          ? "border border-slate-200 bg-white text-indigo-600 shadow-none dark:border-slate-800 dark:bg-slate-900 dark:text-indigo-300"
          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
    item.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-inherit",
  );

  const content = (
    <div
      className={cn(
        "flex w-full items-center gap-2",
        isDashed ? "justify-center" : "justify-between",
      )}
    >
      <span className={cn("flex items-center gap-2", isDashed && "justify-center")}>
        {item.icon}
        <span className="flex items-center gap-1">
          {item.label}
          {showInlineBadge && (
            <span className="text-xs text-slate-400 dark:text-slate-500">{item.badge}</span>
          )}
        </span>
      </span>
      {item.badge && !isDashed && !isPlain && (
        <span
          className={cn(
            "rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-300",
            isPlain && "bg-transparent px-0 text-slate-400 dark:bg-transparent",
          )}
        >
          {item.badge}
        </span>
      )}
      {item.actionLabel && !isDashed && !isPlain && (
        <span
          className={cn(
            "rounded-full border border-dashed border-indigo-200 px-2 py-0.5 text-[11px] text-indigo-500",
            isPlain && "border-transparent px-0 text-slate-400",
          )}
        >
          {item.actionLabel}
        </span>
      )}
    </div>
  );

  if (item.href && !item.disabled) {
    return (
      <Link className={className} href={item.href} {...(onClick ? { onClick: handleClick } : {})}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      {...(!item.disabled && onClick ? { onClick: handleClick } : {})}
    >
      {content}
    </button>
  );
}

export default React.memo(SidebarItem);
