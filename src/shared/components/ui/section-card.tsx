import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

import { cn } from "@/shared/utils/cn";

type SectionCardProps = {
  title: string;
  description?: string;
  meta?: ReactNode;
  onClick?: () => void;
  className?: string;
};

export default function SectionCard({
  title,
  description,
  meta,
  onClick,
  className,
}: SectionCardProps) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] px-4 py-4 transition hover:-translate-y-[1px] hover:border-[var(--app-primary)] hover:shadow-md sm:px-6 sm:py-5",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
        {meta}
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-surface-2)] text-[var(--app-muted)] transition group-hover:bg-[var(--app-primary-soft)] group-hover:text-[var(--app-primary)]">
        <ChevronRightIcon fontSize="small" />
      </div>
    </Paper>
  );
}
