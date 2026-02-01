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
        "group flex cursor-pointer items-center justify-between rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] px-6 py-5 transition hover:-translate-y-[1px] hover:border-indigo-200 hover:shadow-md",
        className,
      )}
    >
      <div className="space-y-1">
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
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition group-hover:bg-indigo-50 group-hover:text-indigo-500 dark:bg-slate-800">
        <ChevronRightIcon fontSize="small" />
      </div>
    </Paper>
  );
}
