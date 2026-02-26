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
        "group flex items-center justify-between gap-4 rounded-2xl border border-[var(--app-border)] bg-[linear-gradient(165deg,rgba(255,255,255,0.96),rgba(242,246,252,0.82))] px-4 py-4 transition duration-200 hover:-translate-y-[1px] hover:border-[var(--app-primary)] hover:shadow-[0_16px_34px_-24px_rgba(59,130,246,0.45)] dark:bg-[linear-gradient(165deg,rgba(42,42,42,0.95),rgba(33,33,33,0.94))] sm:px-6 sm:py-5",
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
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)] transition group-hover:border-[var(--app-primary)] group-hover:bg-[var(--app-primary-soft)] group-hover:text-[var(--app-primary)]">
        <ChevronRightIcon fontSize="small" />
      </div>
    </Paper>
  );
}
