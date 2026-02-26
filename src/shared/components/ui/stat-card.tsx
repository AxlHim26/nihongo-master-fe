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
  neutral: "bg-[var(--app-surface-2)] text-[var(--app-muted)]",
  primary:
    "bg-[linear-gradient(135deg,var(--app-primary-soft),rgba(96,165,250,0.22))] text-[var(--app-primary)]",
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
        "flex items-center gap-4 rounded-2xl border border-[var(--app-border)] bg-[linear-gradient(165deg,rgba(255,255,255,0.98),rgba(242,246,252,0.86))] p-5 transition duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_30px_-24px_rgba(59,130,246,0.45)] dark:bg-[linear-gradient(165deg,rgba(42,42,42,0.95),rgba(33,33,33,0.94))]",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--app-border)]",
          toneClasses[tone],
        )}
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
