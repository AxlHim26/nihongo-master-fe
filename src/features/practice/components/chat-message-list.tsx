import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { ConversationMessage } from "@/features/practice/types/practice";
import { cn } from "@/shared/utils/cn";

type ChatMessageListProps = {
  messages: ConversationMessage[];
  draftMessage?: string;
};

const emotionLabel: Record<NonNullable<ConversationMessage["emotion"]>, string> = {
  happy: "うれしい",
  sad: "さみしい",
  surprised: "びっくり",
  caring: "やさしい",
  shy: "てれ",
  confused: "とまどい",
  neutral: "",
};

export default function ChatMessageList({ messages, draftMessage }: ChatMessageListProps) {
  return (
    <Stack spacing={2} className="flex w-full py-6">
      {messages.map((message) => {
        const isTyping = message.role === "assistant" && message.content.trim().length === 0;
        return (
          <Box
            key={message.id}
            className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
          >
            {message.role === "assistant" && (
              <Avatar className="h-8 w-8 bg-blue-100 text-blue-600 dark:bg-[var(--app-surface-2)] dark:text-[var(--app-primary)]">
                <SmartToyIcon fontSize="small" />
              </Avatar>
            )}
            <Box className="max-w-[88%] sm:max-w-[78%] lg:max-w-[72%]">
              {message.role === "assistant" && message.emotion && message.emotion !== "neutral" && (
                <Typography variant="caption" className="mb-1 block text-slate-400">
                  {emotionLabel[message.emotion]}
                </Typography>
              )}
              <Box
                className={cn(
                  "rounded-2xl px-4 py-2 text-sm",
                  message.role === "user"
                    ? "bg-[var(--app-chat-user-bg)] text-white shadow-sm"
                    : "bg-[var(--app-chat-assistant-bg)] text-slate-700 shadow-sm ring-1 ring-slate-200 dark:text-[var(--app-fg)] dark:ring-[var(--app-border)]",
                )}
              >
                {isTyping ? (
                  <div className="flex items-end gap-1 text-lg leading-none text-[var(--app-muted)]">
                    <span className="animate-bounce [animation-delay:0ms]">.</span>
                    <span className="animate-bounce [animation-delay:120ms]">.</span>
                    <span className="animate-bounce [animation-delay:240ms]">.</span>
                  </div>
                ) : (
                  <Typography variant="body2" className="whitespace-pre-wrap">
                    {message.content}
                  </Typography>
                )}
              </Box>
            </Box>
            {message.role === "user" && (
              <Avatar className="h-8 w-8 bg-slate-100 text-slate-600 dark:bg-[var(--app-surface-2)] dark:text-[var(--app-muted)]">
                <PersonIcon fontSize="small" />
              </Avatar>
            )}
          </Box>
        );
      })}
      {draftMessage && (
        <Box className="flex justify-end gap-3 opacity-60">
          <Box className="bg-[var(--app-chat-user-bg)]/80 max-w-[88%] rounded-2xl px-4 py-2 text-sm text-white sm:max-w-[78%] lg:max-w-[72%]">
            <Typography variant="body2" className="whitespace-pre-wrap">
              {draftMessage}
            </Typography>
          </Box>
          <Avatar className="h-8 w-8 bg-slate-100 text-slate-600 dark:bg-[var(--app-surface-2)] dark:text-[var(--app-muted)]">
            <PersonIcon fontSize="small" />
          </Avatar>
        </Box>
      )}
    </Stack>
  );
}
