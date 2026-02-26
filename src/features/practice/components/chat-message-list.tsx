import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import VolumeUpOutlinedIcon from "@mui/icons-material/VolumeUpOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import * as React from "react";

import type { ConversationMessage } from "@/features/practice/types/practice";
import { getPreferredJapaneseFemaleVoice } from "@/features/practice/utils/voice-picker";
import { cn } from "@/shared/utils/cn";

type ChatMessageListProps = {
  messages: ConversationMessage[];
  draftMessage?: string;
};

type GrammarFeedback = {
  corrected: string;
  explanation: string;
  betterSuggestion: string;
};

const furiganaPattern = /([\p{Script=Han}々ヶヵ]+)\(([^()]+)\)/gu;

const stripFuriganaNotation = (text: string) => text.replace(furiganaPattern, "$1");

const actionIconSx = {
  p: 0,
  minWidth: 0,
  color: "var(--app-muted)",
  "& .MuiSvgIcon-root": {
    fontSize: "1rem",
  },
  "&:hover": {
    backgroundColor: "transparent",
    color: "var(--app-fg)",
  },
} as const;

const renderAssistantContent = (text: string) => {
  const lines = text.split("\n");

  return lines.map((line, lineIndex) => {
    const chunks: React.ReactNode[] = [];
    let last = 0;

    for (const match of line.matchAll(furiganaPattern)) {
      const index = match.index ?? 0;
      if (index > last) {
        chunks.push(
          <React.Fragment key={`plain-${lineIndex}-${index}`}>
            {line.slice(last, index)}
          </React.Fragment>,
        );
      }

      const base = match[1] ?? "";
      const reading = match[2] ?? "";
      chunks.push(
        <ruby key={`ruby-${lineIndex}-${index}`} className="mx-[1px] align-baseline">
          {base}
          <rt className="text-[0.58rem] leading-none text-[var(--app-muted)]">{reading}</rt>
        </ruby>,
      );

      last = index + match[0].length;
    }

    if (last < line.length) {
      chunks.push(
        <React.Fragment key={`tail-${lineIndex}-${last}`}>{line.slice(last)}</React.Fragment>,
      );
    }

    if (chunks.length === 0) {
      chunks.push(<React.Fragment key={`line-${lineIndex}`}>{line}</React.Fragment>);
    }

    return (
      <React.Fragment key={`render-${lineIndex}`}>
        {chunks}
        {lineIndex < lines.length - 1 ? <br /> : null}
      </React.Fragment>
    );
  });
};

export default function ChatMessageList({ messages, draftMessage }: ChatMessageListProps) {
  const [translationMap, setTranslationMap] = React.useState<Record<string, string>>({});
  const [translatingId, setTranslatingId] = React.useState<string | null>(null);

  const [grammarCache, setGrammarCache] = React.useState<Record<string, GrammarFeedback>>({});
  const [grammarLoadingMap, setGrammarLoadingMap] = React.useState<Record<string, boolean>>({});
  const [grammarDialogId, setGrammarDialogId] = React.useState<string | null>(null);
  const [grammarError, setGrammarError] = React.useState<string | null>(null);

  const grammarDialogMessage =
    messages.find((message) => message.id === grammarDialogId && message.role === "user") ?? null;

  const playMessage = React.useCallback(async (rawText: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const text = stripFuriganaNotation(rawText).trim();
    if (!text) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const japaneseVoice = await getPreferredJapaneseFemaleVoice();

    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
      utterance.lang = japaneseVoice.lang || "ja-JP";
    } else {
      utterance.lang = "ja-JP";
    }

    utterance.rate = 0.96;
    utterance.pitch = 1.06;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const translateMessage = React.useCallback(
    async (message: ConversationMessage) => {
      const id = message.id;
      if (translationMap[id]) {
        return;
      }

      setTranslatingId(id);

      try {
        const response = await fetch("/api/kanji/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts: [stripFuriganaNotation(message.content)] }),
        });

        if (!response.ok) {
          throw new Error("Không thể dịch tin nhắn.");
        }

        const payload = (await response.json()) as { translations?: string[] };
        const translated = payload.translations?.[0]?.trim() || "Không có bản dịch.";
        setTranslationMap((prev) => ({ ...prev, [id]: translated }));
      } catch {
        setTranslationMap((prev) => ({ ...prev, [id]: "Không thể dịch lúc này." }));
      } finally {
        setTranslatingId(null);
      }
    },
    [translationMap],
  );

  const openGrammarCheck = React.useCallback(
    async (message: ConversationMessage) => {
      const id = message.id;
      setGrammarDialogId(id);
      setGrammarError(null);

      if (grammarCache[id]) {
        return;
      }

      setGrammarLoadingMap((prev) => ({ ...prev, [id]: true }));

      try {
        const response = await fetch("/api/practice/grammar-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: message.content }),
        });

        if (!response.ok) {
          throw new Error("Không thể kiểm tra ngữ pháp lúc này.");
        }

        const payload = (await response.json()) as GrammarFeedback;
        setGrammarCache((prev) => ({ ...prev, [id]: payload }));
      } catch (error) {
        setGrammarError(
          error instanceof Error ? error.message : "Không thể kiểm tra ngữ pháp lúc này.",
        );
      } finally {
        setGrammarLoadingMap((prev) => ({ ...prev, [id]: false }));
      }
    },
    [grammarCache],
  );

  return (
    <>
      <Stack spacing={2} className="flex w-full py-6">
        {messages.map((message) => {
          const isTyping = message.role === "assistant" && message.content.trim().length === 0;
          const isTranslating = translatingId === message.id;
          const translatedText = translationMap[message.id] ?? "";
          const hasTranslated = translatedText.length > 0;

          return (
            <Box
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 bg-blue-100 text-blue-600 dark:bg-[var(--app-surface-2)] dark:text-[var(--app-primary)]">
                  <SmartToyIcon fontSize="small" />
                </Avatar>
              )}

              <Box className="max-w-[88%] sm:max-w-[80%] lg:max-w-[75%]">
                <Box
                  className={cn(
                    "text-sm",
                    message.role === "user"
                      ? "bg-[var(--app-chat-user-bg)] text-white shadow-sm"
                      : "bg-transparent text-slate-900 shadow-none dark:text-[var(--app-fg)]",
                    message.role === "user" ? "rounded-2xl px-4 py-2" : "px-0 py-0",
                  )}
                >
                  {isTyping ? (
                    <div className="flex items-end gap-1 text-lg leading-none text-[var(--app-muted)]">
                      <span className="animate-bounce [animation-delay:0ms]">.</span>
                      <span className="animate-bounce [animation-delay:120ms]">.</span>
                      <span className="animate-bounce [animation-delay:240ms]">.</span>
                    </div>
                  ) : message.role === "assistant" ? (
                    <Typography variant="body2" className="whitespace-pre-wrap leading-7">
                      {renderAssistantContent(message.content)}
                    </Typography>
                  ) : (
                    <Typography variant="body2" className="whitespace-pre-wrap">
                      {message.content}
                    </Typography>
                  )}

                  {message.role === "assistant" && hasTranslated && (
                    <Box
                      className="mt-2 pl-3"
                      sx={{ borderLeft: "3px solid rgba(148, 163, 184, 0.55)" }}
                    >
                      <Typography className="text-[0.98rem] font-normal italic leading-[1.45] text-slate-500 dark:text-slate-300">
                        {translatedText}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {!isTyping && (
                  <Box
                    className={cn(
                      "mt-2 flex items-center gap-2",
                      message.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {message.role === "assistant" && (
                      <>
                        <Tooltip title="Phát âm">
                          <IconButton
                            size="small"
                            disableRipple
                            onClick={() => void playMessage(message.content)}
                            sx={actionIconSx}
                          >
                            <VolumeUpOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {!hasTranslated && (
                          <Tooltip title="Dịch">
                            <IconButton
                              size="small"
                              disableRipple
                              onClick={() => void translateMessage(message)}
                              sx={actionIconSx}
                            >
                              {isTranslating ? (
                                <CircularProgress size={14} thickness={5} />
                              ) : (
                                <TranslateOutlinedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    )}

                    {message.role === "user" && (
                      <Tooltip title="Check Grammar">
                        <IconButton
                          size="small"
                          disableRipple
                          onClick={() => void openGrammarCheck(message)}
                          sx={actionIconSx}
                        >
                          {grammarLoadingMap[message.id] ? (
                            <CircularProgress size={14} thickness={5} />
                          ) : (
                            <SpellcheckIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )}
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

      <Dialog
        open={Boolean(grammarDialogId)}
        onClose={() => setGrammarDialogId(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          className: "rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)]",
        }}
      >
        <DialogContent className="space-y-3 p-5">
          <Typography variant="h6" className="font-semibold text-[var(--app-fg)]">
            Check Grammar
          </Typography>

          {grammarDialogMessage && (
            <Box className="bg-[var(--app-surface-2)]/70 rounded-xl border border-[var(--app-border)] px-3 py-2">
              <Typography variant="caption" className="text-[var(--app-muted)]">
                Câu của bạn
              </Typography>
              <Typography variant="body2" className="mt-0.5 text-[var(--app-fg)]">
                {grammarDialogMessage.content}
              </Typography>
            </Box>
          )}

          {grammarDialogId && grammarLoadingMap[grammarDialogId] && (
            <Box className="flex items-center gap-2 py-1 text-[var(--app-muted)]">
              <CircularProgress size={16} />
              <Typography variant="body2">Đang phân tích...</Typography>
            </Box>
          )}

          {grammarError && (
            <Typography variant="body2" className="text-rose-500">
              {grammarError}
            </Typography>
          )}

          {grammarDialogId && grammarCache[grammarDialogId] && (
            <Box className="space-y-2">
              <Box className="bg-[var(--app-surface-2)]/70 rounded-xl border border-[var(--app-border)] px-3 py-2">
                <Typography variant="caption" className="text-[var(--app-muted)]">
                  Sửa gợi ý
                </Typography>
                <Typography variant="body2" className="mt-0.5 text-[var(--app-fg)]">
                  {grammarCache[grammarDialogId].corrected}
                </Typography>
              </Box>

              <Box className="bg-[var(--app-surface-2)]/70 rounded-xl border border-[var(--app-border)] px-3 py-2">
                <Typography variant="caption" className="text-[var(--app-muted)]">
                  Nhận xét
                </Typography>
                <Typography variant="body2" className="mt-0.5 text-[var(--app-fg)]">
                  {grammarCache[grammarDialogId].explanation}
                </Typography>
              </Box>

              <Box className="bg-[var(--app-surface-2)]/70 rounded-xl border border-[var(--app-border)] px-3 py-2">
                <Typography variant="caption" className="text-[var(--app-muted)]">
                  Câu tự nhiên hơn
                </Typography>
                <Typography variant="body2" className="mt-0.5 text-[var(--app-fg)]">
                  {grammarCache[grammarDialogId].betterSuggestion}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
