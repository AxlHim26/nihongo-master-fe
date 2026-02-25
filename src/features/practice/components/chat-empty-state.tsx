import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type ChatEmptyStateProps = {
  prompts?: string[];
  onPrompt?: (prompt: string) => void;
};

export default function ChatEmptyState({ prompts = [], onPrompt }: ChatEmptyStateProps) {
  return (
    <Stack
      spacing={1}
      alignItems="center"
      className="flex flex-1 items-center justify-center py-12 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-[var(--app-surface-2)] dark:text-[var(--app-fg-muted)]">
        <AutoAwesomeIcon />
      </div>
      <Typography variant="h6" fontWeight={600}>
        Bắt đầu trò chuyện
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Hỏi về ngữ pháp, từ vựng hoặc luyện hội thoại
      </Typography>
      {prompts.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onPrompt?.(prompt)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-blue-200 hover:text-blue-600 dark:border-[var(--app-border)] dark:bg-[var(--app-surface-2)] dark:text-[var(--app-muted)] dark:hover:border-[var(--app-active-border)] dark:hover:text-[var(--app-fg)]"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
    </Stack>
  );
}
