import Link from "next/link";
import * as React from "react";

import type { NavItem } from "@/shared/types/navigation";
import { cn } from "@/shared/utils/cn";

type SidebarItemProps = {
  item: NavItem;
  active?: boolean;
  onClick?: (id: string) => void;
  forceBold?: boolean;
};

function SidebarItem({ item, active, onClick, forceBold }: SidebarItemProps) {
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
          "rounded-lg px-3 py-2 text-[var(--app-muted)] hover:bg-transparent hover:text-[var(--app-fg)]",
          active && "text-[var(--app-fg)]",
        )
      : isDashed
        ? "border border-dashed border-slate-200 bg-transparent text-slate-500 hover:border-blue-200 hover:text-blue-600 dark:border-[var(--app-border)] dark:text-[var(--app-muted)] dark:hover:border-[var(--app-active-border)] dark:hover:text-[var(--app-active-fg)]"
        : active
          ? "border border-slate-200 bg-white text-blue-600 shadow-none dark:border-[var(--app-active-border)] dark:bg-[var(--app-active-bg)] dark:text-[var(--app-active-fg)]"
          : "text-slate-600 hover:text-slate-900 dark:text-[var(--app-muted)] dark:hover:text-[var(--app-fg)]",
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
        <span className={cn("flex items-center gap-1", forceBold && "font-semibold")}>
          {item.label}
          {showInlineBadge && (
            <span className="text-xs text-[var(--app-fg-muted)]">{item.badge}</span>
          )}
        </span>
      </span>
      {item.badge && !isDashed && !isPlain && (
        <span
          className={cn(
            "rounded-full bg-[var(--app-surface-2)] px-2 py-0.5 text-[11px] text-[var(--app-muted)]",
            isPlain && "bg-transparent px-0 text-[var(--app-fg-muted)]",
          )}
        >
          {item.badge}
        </span>
      )}
      {item.actionLabel && !isDashed && !isPlain && (
        <span
          className={cn(
            "rounded-full border border-dashed border-blue-200 px-2 py-0.5 text-[11px] text-blue-500",
            isPlain &&
              "border-transparent px-0 text-[var(--app-fg-muted)] dark:text-[var(--app-fg-muted)]",
            !isPlain && "dark:border-[var(--app-active-border)] dark:text-[var(--app-fg-muted)]",
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
