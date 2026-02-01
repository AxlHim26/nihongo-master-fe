"use client";

import AddIcon from "@mui/icons-material/Add";
import CallIcon from "@mui/icons-material/Call";
import MicOffIcon from "@mui/icons-material/MicOff";
import SettingsIcon from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useShallow } from "zustand/react/shallow";

import AgentSettings from "@/features/practice/components/agent-settings";
import ChatComposer from "@/features/practice/components/chat-composer";
import ChatEmptyState from "@/features/practice/components/chat-empty-state";
import ChatMessageList from "@/features/practice/components/chat-message-list";
import ConversationList from "@/features/practice/components/conversation-list";
import { samplePrompts } from "@/features/practice/data/sample-prompts";
import { useSpeechRecognition } from "@/features/practice/hooks/use-speech-recognition";
import { getConversations } from "@/features/practice/services/practice-service";
import { usePracticeStore } from "@/features/practice/stores/practice-store";
import type { AgentSettings as AgentSettingsType } from "@/features/practice/types/agent";
import type { Conversation, ConversationMessage } from "@/features/practice/types/practice";

const createMessage = (
  content: string,
  role: ConversationMessage["role"],
): ConversationMessage => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  content,
  role,
  createdAt: new Date().toISOString(),
});

export default function PracticeChatView() {
  const { data, isError } = useQuery({
    queryKey: ["practice", "conversations"],
    queryFn: getConversations,
  });
  const { activeConversationId, setActiveConversationId, agentSettings, updateAgentSettings } =
    usePracticeStore(
      useShallow((state) => ({
        activeConversationId: state.activeConversationId,
        setActiveConversationId: state.setActiveConversationId,
        agentSettings: state.agentSettings,
        updateAgentSettings: state.updateAgentSettings,
      })),
    );
  const streamRef = React.useRef<AbortController | null>(null);
  const speechQueueRef = React.useRef<string[]>([]);
  const speechBufferRef = React.useRef("");
  const speakingRef = React.useRef(false);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [streamError, setStreamError] = React.useState<string | null>(null);
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [interimTranscript, setInterimTranscript] = React.useState("");
  const [voiceReady, setVoiceReady] = React.useState(false);
  const [selectedVoice, setSelectedVoice] = React.useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [llmProvider, setLlmProvider] = React.useState<"megallm" | "local">("local");
  const [callActive, setCallActive] = React.useState(false);
  const [callMuted, setCallMuted] = React.useState(false);
  const [callSeconds, setCallSeconds] = React.useState(0);
  const [lastUserUtterance, setLastUserUtterance] = React.useState("");
  const [lastAssistantUtterance, setLastAssistantUtterance] = React.useState("");
  const [settingsAnchor, setSettingsAnchor] = React.useState<HTMLElement | null>(null);
  const lastUserSentRef = React.useRef<{ text: string; at: number }>({ text: "", at: 0 });
  const hydratedRef = React.useRef(false);
  const normalizeText = React.useCallback(
    (value: string) =>
      value
        .toLowerCase()
        .replace(/[\s、。！？!?.,]/g, "")
        .trim(),
    [],
  );

  React.useEffect(() => {
    if (!data || hydratedRef.current) {
      return;
    }
    setConversations(data);
    if (!activeConversationId && data.length > 0) {
      const first = data[0];
      if (first) {
        setActiveConversationId(first.id);
      }
    }
    hydratedRef.current = true;
  }, [data, activeConversationId, setActiveConversationId]);

  const activeConversation = conversations.find((conv) => conv.id === activeConversationId) ?? null;

  React.useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    const synth = window.speechSynthesis;
    const preferredNames = ["Kyoko", "Haruka", "Ayumi", "Sayaka", "Siri", "Mei", "Nanami"];
    const updateVoices = () => {
      const voices = synth.getVoices();
      const japanese = voices.filter((voice) => voice.lang.startsWith("ja"));
      setAvailableVoices(japanese.length > 0 ? japanese : voices);
      const femaleByName = japanese.find((voice) =>
        preferredNames.some((name) => voice.name.toLowerCase().includes(name.toLowerCase())),
      );
      const femaleByHint = japanese.find((voice) => /female|woman|girl/i.test(voice.name));
      setSelectedVoice((prev) => {
        if (prev) {
          const match = voices.find((voice) => voice.voiceURI === prev.voiceURI);
          if (match) {
            return match;
          }
        }
        return femaleByName ?? femaleByHint ?? japanese[0] ?? voices[0] ?? null;
      });
      setVoiceReady(true);
    };
    updateVoices();
    synth.addEventListener("voiceschanged", updateVoices);
    return () => synth.removeEventListener("voiceschanged", updateVoices);
  }, []);

  React.useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await fetch("/api/status", { cache: "no-store" });
        if (!response.ok) {
          setLlmProvider("local");
          return;
        }
        const data = (await response.json()) as {
          data?: { llmProvider?: "megallm" | "local" };
        };
        if (data.data?.llmProvider) {
          setLlmProvider(data.data.llmProvider);
        }
      } catch {
        // ignore
      }
    };
    loadStatus();
  }, []);

  const resetStream = () => {
    streamRef.current?.abort();
    streamRef.current = null;
    setIsStreaming(false);
  };

  const speakNext = React.useCallback(
    (settings: AgentSettingsType) => {
      if (speakingRef.current) {
        return;
      }
      const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
      if (!synth) {
        return;
      }
      const next = speechQueueRef.current.shift();
      if (!next) {
        return;
      }
      const utterance = new SpeechSynthesisUtterance(next);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      const emotional = Math.min(100, Math.max(0, settings.emotional));
      utterance.rate = 1.0 + emotional / 600;
      utterance.pitch = 1.05 + emotional / 700;
      utterance.onend = () => {
        speakingRef.current = false;
        speakNext(settings);
      };
      speakingRef.current = true;
      synth.speak(utterance);
    },
    [selectedVoice],
  );

  const enqueueSpeech = React.useCallback(
    (text: string, settings: AgentSettingsType) => {
      if (!voiceReady || !text.trim()) {
        return;
      }
      speechQueueRef.current.push(text);
      speakNext(settings);
    },
    [speakNext, voiceReady],
  );

  const appendChunk = React.useCallback(
    (conversationId: string, messageId: string, chunk: string) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === messageId ? { ...msg, content: `${msg.content}${chunk}` } : msg,
                ),
              }
            : conv,
        ),
      );
    },
    [],
  );

  const handleCreateConversation = () => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: "Cuộc trò chuyện mới",
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const ensureConversation = React.useCallback(() => {
    if (activeConversation) {
      return activeConversation;
    }
    const created: Conversation = {
      id: `conv-${Date.now()}`,
      title: "Cuộc trò chuyện mới",
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setConversations((prev) => [created, ...prev]);
    setActiveConversationId(created.id);
    return created;
  }, [activeConversation, setActiveConversationId]);

  const streamResponse = React.useCallback(
    async (
      message: string,
      settings: AgentSettingsType,
      conversationId: string,
      messageId: string,
    ) => {
      const controller = new AbortController();
      streamRef.current?.abort();
      streamRef.current = controller;
      setIsStreaming(true);
      setStreamError(null);
      speechBufferRef.current = "";

      try {
        const response = await fetch("/api/practice/realtime", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, settings }),
          signal: controller.signal,
        });

        if (!response.body) {
          throw new Error("Không thể kết nối streaming");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) {
              continue;
            }
            const chunk = line.replace("data: ", "");
            if (chunk === "[DONE]") {
              const leftover = speechBufferRef.current.trim();
              if (leftover) {
                enqueueSpeech(leftover, settings);
              }
              resetStream();
              return;
            }
            appendChunk(conversationId, messageId, chunk);
            speechBufferRef.current += chunk;
            setLastAssistantUtterance((prev) => `${prev}${chunk}`);
            if (/[。！？\n]/.test(chunk) || speechBufferRef.current.length > 12) {
              const toSpeak = speechBufferRef.current.trim();
              if (toSpeak) {
                enqueueSpeech(toSpeak, settings);
              }
              speechBufferRef.current = "";
            }
          }
        }
      } catch {
        if (!controller.signal.aborted) {
          setStreamError("Kết nối bị gián đoạn. Vui lòng thử lại.");
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [appendChunk, enqueueSpeech],
  );

  const handleSendMessage = React.useCallback(
    (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) {
        return;
      }
      const normalized = normalizeText(trimmed);
      const last = lastUserSentRef.current;
      if (last.text && last.text === normalized && Date.now() - last.at < 2000) {
        return;
      }
      lastUserSentRef.current = { text: normalized, at: Date.now() };
      setInterimTranscript("");
      setLastUserUtterance(trimmed);
      setLastAssistantUtterance("");
      const active = ensureConversation();
      const activeId = active.id;
      const userLine = trimmed;
      const assistantLine = "";

      const userMessage = createMessage(userLine, "user");
      const assistantMessage = createMessage(assistantLine, "assistant");

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeId
            ? {
                ...conv,
                messages: [...conv.messages, userMessage, assistantMessage],
              }
            : conv,
        ),
      );

      streamResponse(trimmed, agentSettings, activeId, assistantMessage.id);
    },
    [agentSettings, ensureConversation, normalizeText, streamResponse],
  );

  const recognition = useSpeechRecognition({
    lang: "ja-JP",
    onFinal: handleSendMessage,
    onInterim: setInterimTranscript,
  });

  const {
    supported: micSupported,
    listening: micListening,
    start: startMic,
    stop: stopMic,
  } = recognition;

  React.useEffect(() => {
    if (!micSupported) {
      return;
    }
    if (callActive && !callMuted) {
      startMic();
    } else {
      stopMic();
    }
    return () => stopMic();
  }, [callActive, callMuted, micSupported, startMic, stopMic]);

  React.useEffect(() => {
    if (!callActive) {
      setCallSeconds(0);
      return;
    }
    const timer = window.setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [callActive]);

  const handleStartCall = () => {
    setCallActive(true);
    setCallMuted(false);
    if (micSupported) {
      startMic();
    }
  };

  const handleEndCall = () => {
    setCallActive(false);
    setCallMuted(false);
    setInterimTranscript("");
    if (micSupported) {
      stopMic();
    }
  };

  const toggleMute = () => {
    setCallMuted((prev) => {
      const next = !prev;
      if (micSupported) {
        if (next) {
          stopMic();
        } else {
          startMic();
        }
      }
      return next;
    });
  };

  const callTime = `${String(Math.floor(callSeconds / 60)).padStart(2, "0")}:${String(
    callSeconds % 60,
  ).padStart(2, "0")}`;

  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceURI = event.target.value;
    const voice = availableVoices.find((item) => item.voiceURI === voiceURI);
    if (voice) {
      setSelectedVoice(voice);
    }
  };

  const settingsOpen = Boolean(settingsAnchor);
  const handleOpenSettings = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSettingsAnchor(event.currentTarget);
  };
  const handleCloseSettings = () => setSettingsAnchor(null);

  return (
    <Box className="flex h-full flex-col">
      <Box className="flex flex-1 flex-col gap-4 lg:flex-row">
        <Paper
          elevation={0}
          className="flex min-h-0 flex-1 flex-col rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)]"
        >
          <Box className="flex min-h-0 flex-1 flex-col px-6 pt-6">
            <Box className="mx-auto flex w-full max-w-xl flex-1 flex-col sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
              {callActive ? (
                <Box className="flex flex-1 flex-col items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-slate-700">Maya {callTime}</p>
                    <p className="text-xs text-slate-400">by sesame</p>
                  </div>
                  <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-sky-200 via-indigo-200 to-purple-200 shadow-inner" />
                  <div className="space-y-2 text-center text-sm text-slate-500">
                    <p>
                      AI: <span className="text-slate-700">{lastAssistantUtterance || "…"}</span>
                    </p>
                    <p>
                      Bạn:{" "}
                      <span className="text-slate-700">
                        {interimTranscript || lastUserUtterance || "…"}
                      </span>
                    </p>
                  </div>
                </Box>
              ) : isError ? (
                <ChatEmptyState prompts={samplePrompts} onPrompt={handleSendMessage} />
              ) : (activeConversation && activeConversation.messages.length > 0) ||
                interimTranscript ? (
                <ChatMessageList
                  messages={activeConversation?.messages ?? []}
                  draftMessage={interimTranscript}
                />
              ) : (
                <ChatEmptyState prompts={samplePrompts} onPrompt={handleSendMessage} />
              )}
              {streamError && (
                <Typography variant="caption" color="error" className="mt-2">
                  {streamError}
                </Typography>
              )}
              {!micSupported && (
                <Typography variant="caption" color="text.secondary" className="mt-2">
                  Trình duyệt chưa hỗ trợ voice input. Hãy nhập bằng bàn phím.
                </Typography>
              )}
            </Box>
          </Box>

          <Box className="px-6 pb-6 pt-2">
            <div className="mx-auto w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
              {callActive ? (
                <div className="mx-auto flex w-full max-w-md items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                  >
                    {callMuted ? <MicOffIcon fontSize="small" /> : <CallIcon fontSize="small" />}
                    {callMuted ? "Unmute" : "Mute"}
                  </button>
                  <button
                    type="button"
                    onClick={handleEndCall}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-sm text-white shadow-sm"
                  >
                    End call
                  </button>
                </div>
              ) : (
                <ChatComposer onSend={handleSendMessage} onCall={handleStartCall} />
              )}
            </div>
            <Typography variant="caption" color="text.secondary" className="mt-2 block text-right">
              Dữ liệu được lưu cục bộ
            </Typography>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          className="flex min-h-0 w-full flex-col rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] lg:w-[320px] lg:shrink-0"
        >
          <Box className="flex items-center gap-2 px-4 pt-4">
            <IconButton size="small" onClick={handleOpenSettings}>
              <SettingsIcon fontSize="small" />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleCreateConversation}
              className="flex-1 justify-start rounded-full border-slate-200 text-slate-700"
            >
              Trò chuyện mới
            </Button>
          </Box>
          <Divider className="my-4" />
          <Box className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-0">
            <ConversationList
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={setActiveConversationId}
            />
          </Box>
        </Paper>
      </Box>
      <Popover
        open={settingsOpen}
        anchorEl={settingsAnchor}
        onClose={handleCloseSettings}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          className:
            "w-[320px] rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950",
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Cấu hình hội thoại
        </Typography>
        <div className="mt-4">
          <AgentSettings settings={agentSettings} onChange={updateAgentSettings} />
        </div>
        <div className="mt-4 space-y-2">
          <Typography variant="caption" color="text.secondary">
            Giọng nói (TTS)
          </Typography>
          <select
            value={selectedVoice?.voiceURI ?? ""}
            onChange={handleVoiceChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            {availableVoices.length === 0 ? (
              <option value="">No voice</option>
            ) : (
              availableVoices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))
            )}
          </select>
          <Typography variant="caption" color="text.secondary">
            LLM: {llmProvider === "megallm" ? "MegaLLM" : "Local fallback"}
          </Typography>
          {!voiceReady && (
            <Typography variant="caption" color="text.secondary">
              Trình duyệt chưa tải xong giọng đọc.
            </Typography>
          )}
        </div>
        {micSupported && (
          <Typography variant="caption" color="text.secondary" className="mt-3 block">
            Mic: {micListening ? "Đang nghe" : "Tạm dừng"}
          </Typography>
        )}
        {isStreaming && (
          <Typography variant="caption" color="text.secondary" className="mt-2 block">
            AI đang trả lời…
          </Typography>
        )}
      </Popover>
    </Box>
  );
}
