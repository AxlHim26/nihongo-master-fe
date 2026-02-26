import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

import { cn } from "@/shared/utils/cn";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Paper
      elevation={0}
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--app-border)] bg-[linear-gradient(165deg,rgba(255,255,255,0.94),rgba(242,246,252,0.82))] px-6 py-16 text-center dark:bg-[linear-gradient(165deg,rgba(42,42,42,0.95),rgba(33,33,33,0.92))]",
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-[var(--app-surface-2)] dark:text-[var(--app-muted)]">
        {icon}
      </div>
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" className="mt-1">
          {description}
        </Typography>
      )}
      {action && <div className="mt-4">{action}</div>}
    </Paper>
  );
}
