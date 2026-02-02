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
      {messages.map((message) => (
        <Box
          key={message.id}
          className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
        >
          {message.role === "assistant" && (
            <Avatar className="h-8 w-8 bg-indigo-100 text-indigo-600">
              <SmartToyIcon fontSize="small" />
            </Avatar>
          )}
          <Box className="max-w-[72%]">
            {message.role === "assistant" && message.emotion && message.emotion !== "neutral" && (
              <Typography variant="caption" className="mb-1 block text-slate-400">
                {emotionLabel[message.emotion]}
              </Typography>
            )}
            <Box
              className={cn(
                "rounded-2xl px-4 py-2 text-sm",
                message.role === "user"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800",
              )}
            >
              <Typography variant="body2" className="whitespace-pre-wrap">
                {message.content}
              </Typography>
            </Box>
          </Box>
          {message.role === "user" && (
            <Avatar className="h-8 w-8 bg-slate-100 text-slate-600">
              <PersonIcon fontSize="small" />
            </Avatar>
          )}
        </Box>
      ))}
      {draftMessage && (
        <Box className="flex justify-end gap-3 opacity-60">
          <Box className="max-w-[72%] rounded-2xl bg-indigo-600/80 px-4 py-2 text-sm text-white">
            <Typography variant="body2" className="whitespace-pre-wrap">
              {draftMessage}
            </Typography>
          </Box>
          <Avatar className="h-8 w-8 bg-slate-100 text-slate-600">
            <PersonIcon fontSize="small" />
          </Avatar>
        </Box>
      )}
    </Stack>
  );
}
