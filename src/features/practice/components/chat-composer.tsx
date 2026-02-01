"use client";

import MicIcon from "@mui/icons-material/Mic";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useShallow } from "zustand/react/shallow";

import { usePracticeStore } from "@/features/practice/stores/practice-store";

export type ChatComposerProps = {
  onSend: (message: string) => void;
  onCall?: () => void;
};

export default function ChatComposer({ onSend, onCall }: ChatComposerProps) {
  const { draft, setDraft, clearDraft } = usePracticeStore(
    useShallow((state) => ({
      draft: state.draft,
      setDraft: state.setDraft,
      clearDraft: state.clearDraft,
    })),
  );

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }
    onSend(trimmed);
    clearDraft();
  };

  return (
    <Paper
      elevation={0}
      className="flex w-full items-center gap-3 rounded-full border-2 border-slate-300 bg-white px-4 py-3 shadow-md transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-indigo-400 dark:focus-within:ring-indigo-500/20 sm:px-5 sm:py-4 md:px-6 md:py-4"
    >
      <IconButton size="small" onClick={onCall}>
        <MicIcon fontSize="small" />
      </IconButton>
      <InputBase
        placeholder="Nhập tin nhắn..."
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSend();
          }
        }}
        className="flex-1 text-base sm:text-lg"
      />
      <Stack direction="row" spacing={1}>
        <IconButton size="small" onClick={handleSend}>
          <SendIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
}
