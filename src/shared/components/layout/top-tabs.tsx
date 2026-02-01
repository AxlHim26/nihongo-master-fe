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
    <div className="rounded-2xl bg-slate-100/70 p-1 shadow-inner dark:bg-slate-900/40">
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
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-300"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
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
