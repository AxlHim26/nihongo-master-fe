import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { Conversation } from "@/features/practice/types/practice";
import { cn } from "@/shared/utils/cn";

type ConversationListProps = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
};

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
}: ConversationListProps) {
  return (
    <Box className="flex h-full flex-col gap-4">
      <Box className="space-y-2">
        <Typography variant="caption" color="text.secondary" className="uppercase tracking-wide">
          Cũ hơn
        </Typography>
        <Box className="no-scrollbar flex-1 overflow-y-auto pr-1">
          <Stack spacing={1}>
            {conversations.map((conversation) => (
              <Box
                key={conversation.id}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-xl px-2 py-2 text-sm transition",
                  activeId === conversation.id
                    ? "text-indigo-700 dark:text-indigo-200"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  className="flex flex-1 appearance-none items-center gap-2 border-0 bg-transparent p-0 text-left"
                >
                  <ChatBubbleOutlineIcon fontSize="small" />
                  <span className="truncate">{conversation.title}</span>
                </button>
                <div className="flex items-center gap-1">
                  <IconButton size="small">
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton size="small">
                    <DeleteIcon fontSize="inherit" />
                  </IconButton>
                </div>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
