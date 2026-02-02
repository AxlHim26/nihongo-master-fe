import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as React from "react";

import type { Conversation } from "@/features/practice/types/practice";
import { cn } from "@/shared/utils/cn";

type ConversationListProps = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
};

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  onRename,
  onDelete,
}: ConversationListProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draftTitle, setDraftTitle] = React.useState("");

  const startEditing = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setDraftTitle(conversation.title);
  };

  const commitEditing = (conversationId: string) => {
    const title = draftTitle.trim();
    if (title) {
      onRename(conversationId, title);
    }
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftTitle("");
  };

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
                onDoubleClick={() => startEditing(conversation)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-xl px-2 py-2 text-sm transition",
                  activeId === conversation.id
                    ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-400/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-900/40",
                )}
              >
                {editingId === conversation.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <ChatBubbleOutlineIcon fontSize="small" />
                    <input
                      value={draftTitle}
                      onChange={(event) => setDraftTitle(event.target.value)}
                      onBlur={() => commitEditing(conversation.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          commitEditing(conversation.id);
                        }
                        if (event.key === "Escape") {
                          cancelEditing();
                        }
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      autoFocus
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    className="flex flex-1 appearance-none items-center gap-2 border-0 bg-transparent p-0 text-left"
                  >
                    <ChatBubbleOutlineIcon fontSize="small" />
                    <span className="truncate">{conversation.title}</span>
                  </button>
                )}
                <div className="flex items-center gap-1">
                  <IconButton size="small" onClick={() => startEditing(conversation)}>
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete(conversation.id)}>
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
