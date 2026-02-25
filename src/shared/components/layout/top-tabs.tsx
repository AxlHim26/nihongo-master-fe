import Link from "next/link";
import { usePathname } from "next/navigation";

import type { TopTab } from "@/shared/types/navigation";
import { cn } from "@/shared/utils/cn";

type TopTabsProps = {
  tabs: TopTab[];
};

export default function TopTabs({ tabs }: TopTabsProps) {
  const pathname = usePathname();

  return (
    <div className="rounded-2xl bg-[var(--app-surface-2)] p-1 shadow-inner">
      <div className="no-scrollbar flex flex-nowrap gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition",
                active
                  ? "bg-white text-blue-600 shadow-sm dark:border dark:border-[var(--app-active-border)] dark:bg-[var(--app-active-bg)] dark:text-[var(--app-active-fg)]"
                  : "text-[var(--app-muted)] hover:text-[var(--app-fg)]",
              )}
            >
              {tab.icon}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
