import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

import { cn } from "@/shared/utils/cn";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  className?: string;
  tone?: "neutral" | "primary";
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  neutral: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300",
  primary: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200",
};

export default function StatCard({
  icon,
  label,
  value,
  className,
  tone = "primary",
}: StatCardProps) {
  return (
    <Paper
      elevation={0}
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5",
        className,
      )}
    >
      <div
        className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", toneClasses[tone])}
      >
        {icon}
      </div>
      <div>
        <Typography variant="h6" component="div" className="text-lg font-semibold">
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </div>
    </Paper>
  );
}
