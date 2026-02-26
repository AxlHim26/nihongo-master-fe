"use client";

import AddIcon from "@mui/icons-material/Add";
import CallIcon from "@mui/icons-material/Call";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MicOffIcon from "@mui/icons-material/MicOff";
import SettingsIcon from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useShallow } from "zustand/react/shallow";

import AgentSettings from "@/features/practice/components/agent-settings";
import ChatComposer from "@/features/practice/components/chat-composer";
import ChatEmptyState from "@/features/practice/components/chat-empty-state";
import ChatMessageList from "@/features/practice/components/chat-message-list";
import ConversationList from "@/features/practice/components/conversation-list";
import { samplePrompts } from "@/features/practice/data/sample-prompts";
import { useSpeechRecognition } from "@/features/practice/hooks/use-speech-recognition";
import { usePracticeStore } from "@/features/practice/stores/practice-store";
import type { AgentSettings as AgentSettingsType } from "@/features/practice/types/agent";
import type { Conversation, ConversationMessage } from "@/features/practice/types/practice";
import { detectEmotionTag } from "@/features/practice/utils/emotion-tag";
import { getPreferredJapaneseFemaleVoice } from "@/features/practice/utils/voice-picker";

const createMessage = (
  content: string,
  role: ConversationMessage["role"],
): ConversationMessage => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  content,
  role,
  createdAt: new Date().toISOString(),
});

const subtleOutlinedButtonSx = {
  borderColor: "var(--app-border)",
  color: "var(--app-fg)",
  "&:hover": {
    borderColor: "var(--app-active-border)",
    backgroundColor: "var(--app-surface-2)",
  },
} as const;

const hasKanjiPattern = /[\p{Script=Han}々ヶヵ]/u;
const hasFuriganaPattern = /[\p{Script=Han}々ヶヵ]+\([^()]+\)/u;

export default function PracticeChatView() {
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
  const [callActive, setCallActive] = React.useState(false);
  const [callMuted, setCallMuted] = React.useState(false);
  const [callSeconds, setCallSeconds] = React.useState(0);
  const [lastUserUtterance, setLastUserUtterance] = React.useState("");
  const [lastAssistantUtterance, setLastAssistantUtterance] = React.useState("");
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [waveDuration, setWaveDuration] = React.useState(2.4);
  const [settingsAnchor, setSettingsAnchor] = React.useState<HTMLElement | null>(null);
  const [mobilePanelOpen, setMobilePanelOpen] = React.useState(false);
  const callActiveRef = React.useRef(false);
  const lastUserSentRef = React.useRef<{ text: string; at: number }>({ text: "", at: 0 });
  const hydratedRef = React.useRef(false);
  const lastActivityRef = React.useRef(Date.now());
  const idleStageRef = React.useRef<0 | 1 | 2>(0);
  const lastStoryAtRef = React.useRef(0);
  const idleMessageRef = React.useRef<{ id: string; mode: "prompt" | "story" } | null>(null);
  const idleStoryBufferRef = React.useRef("");
  const lastIdleStoryRef = React.useRef("");
  const speechRateMultiplierRef = React.useRef(1);
  const speechModeRef = React.useRef<"normal" | "story">("normal");
  const storageKey = "practice-conversations";
  const normalizeText = React.useCallback(
    (value: string) =>
      value
        .toLowerCase()
        .replace(/[\s、。！？!?.,]/g, "")
        .trim(),
    [],
  );

  const readStoredConversations = React.useCallback((): Conversation[] => {
    if (typeof window === "undefined") {
      return [];
    }
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as Conversation[];
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter((conv) => conv && typeof conv.id === "string");
    } catch {
      return [];
    }
  }, [storageKey]);

  const persistConversations = React.useCallback(
    (next: Conversation[]) => {
      if (typeof window === "undefined") {
        return;
      }
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey],
  );

  React.useEffect(() => {
    if (hydratedRef.current) {
      return;
    }
    const stored = readStoredConversations();
    setConversations(stored);
    const firstConversation = stored[0];
    if (!activeConversationId && firstConversation) {
      setActiveConversationId(firstConversation.id);
    }
    hydratedRef.current = true;
  }, [activeConversationId, readStoredConversations, setActiveConversationId]);

  React.useEffect(() => {
    if (!hydratedRef.current) {
      return;
    }
    persistConversations(conversations);
  }, [conversations, persistConversations]);

  React.useEffect(() => {
    callActiveRef.current = callActive;
  }, [callActive]);

  const [pendingConversation, setPendingConversation] = React.useState<Conversation | null>(null);
  const activeConversation =
    (pendingConversation && pendingConversation.id === activeConversationId
      ? pendingConversation
      : conversations.find((conv) => conv.id === activeConversationId)) ?? null;

  const speakWithBrowserTts = React.useCallback(async (text: string, rate: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !callActiveRef.current) {
      return Promise.resolve();
    }

    const segments = text.split(/(?<=[。！？!?])\s*/).filter((seg) => seg.trim().length > 0);
    const queue = segments.length ? segments : [text];

    const voice = await getPreferredJapaneseFemaleVoice();

    const speakSegment = (segment: string) =>
      new Promise<void>((resolve) => {
        if (!callActiveRef.current) {
          resolve();
          return;
        }
        const utterance = new SpeechSynthesisUtterance(segment);
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang || "ja-JP";
        } else {
          utterance.lang = "ja-JP";
        }
        const rateBase = Math.max(0.7, Math.min(1.3, rate));
        const rateJitter = (Math.random() * 2 - 1) * 0.03;
        const pitchJitter = (Math.random() * 2 - 1) * 0.03;
        utterance.rate = Math.max(0.65, Math.min(1.35, rateBase + rateJitter));
        utterance.pitch = Math.max(0.95, Math.min(1.35, 1.11 + pitchJitter));
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      });

    return new Promise<void>(async (resolve) => {
      window.speechSynthesis.cancel();
      for (let i = 0; i < queue.length; i += 1) {
        if (!callActiveRef.current) {
          break;
        }
        const segment = queue[i] ?? "";
        await speakSegment(segment);
        if (i < queue.length - 1) {
          await new Promise((pauseResolve) => setTimeout(pauseResolve, 120));
        }
      }
      resolve();
    });
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.getVoices();
  }, []);

  const resetStream = () => {
    streamRef.current?.abort();
    streamRef.current = null;
    setIsStreaming(false);
  };

  const speakNext = React.useCallback(
    async (settings: AgentSettingsType) => {
      if (speakingRef.current) {
        return;
      }
      if (!callActiveRef.current) {
        setIsSpeaking(false);
        return;
      }
      const next = speechQueueRef.current.shift();
      if (!next) {
        setIsSpeaking(false);
        return;
      }
      speakingRef.current = true;
      setIsSpeaking(true);
      const baseRate = Math.max(0.7, Math.min(1.3, settings.speechRate / 100));
      let rateMultiplier = speechRateMultiplierRef.current;
      if (speechModeRef.current === "story") {
        const variability = 0.05;
        const jitter = (Math.random() * 2 - 1) * variability;
        const lengthFactor = next.length > 30 ? -0.08 : next.length < 12 ? 0.08 : 0;
        rateMultiplier = Math.min(0.95, Math.max(0.55, rateMultiplier + jitter + lengthFactor));
      }
      const tempo = Math.max(1.1, Math.min(2.8, 2.4 / (baseRate * rateMultiplier)));
      setWaveDuration(tempo);
      try {
        await speakWithBrowserTts(next, baseRate * rateMultiplier);
      } finally {
        speakingRef.current = false;
        setIsSpeaking(false);
        speakNext(settings);
      }
    },
    [speakWithBrowserTts],
  );

  const enqueueSpeech = React.useCallback(
    (text: string, settings: AgentSettingsType) => {
      if (!text.trim() || !callActiveRef.current) {
        return;
      }
      speechQueueRef.current.push(text);
      speakNext(settings);
    },
    [speakNext],
  );

  const appendChunk = React.useCallback(
    (conversationId: string, messageId: string, chunk: string) => {
      if (idleMessageRef.current?.id === messageId && idleMessageRef.current.mode === "story") {
        idleStoryBufferRef.current += chunk;
      }
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

  const maybeAttachFurigana = React.useCallback(
    async (conversationId: string, messageId: string, content: string) => {
      const text = content.trim();
      if (!text || !hasKanjiPattern.test(text) || hasFuriganaPattern.test(text)) {
        return;
      }

      try {
        const response = await fetch("/api/practice/furigana", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!response.ok) {
          return;
        }
        const payload = (await response.json().catch(() => null)) as { text?: string } | null;
        const converted = payload?.text?.trim();
        if (!converted) {
          return;
        }

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId ? { ...msg, content: converted } : msg,
                  ),
                }
              : conv,
          ),
        );
      } catch {
        // keep original content if conversion fails
      }
    },
    [],
  );

  const finalizeMessageEmotion = React.useCallback((conversationId: string, messageId: string) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== conversationId) {
          return conv;
        }
        return {
          ...conv,
          messages: conv.messages.map((msg) => {
            if (msg.id !== messageId) {
              return msg;
            }
            const emotion = detectEmotionTag(msg.content);
            return { ...msg, emotion };
          }),
        };
      }),
    );
  }, []);

  const buildHistory = React.useCallback((conversation: Conversation | null) => {
    if (!conversation) {
      return [];
    }
    return conversation.messages
      .filter((msg) => msg.content.trim().length > 0)
      .slice(-6)
      .map((msg) => ({ role: msg.role, content: msg.content }));
  }, []);

  const deriveTitle = React.useCallback((text: string) => {
    const sanitized = text.replace(/\s+/g, " ").trim();
    if (!sanitized) {
      return "Cuộc trò chuyện mới";
    }
    return sanitized.length > 36 ? `${sanitized.slice(0, 36).trim()}…` : sanitized;
  }, []);

  const getIdlePrompt = React.useCallback((): string => {
    const prompts = [
      "Start by saying a gentle check-in equivalent to 'Bạn còn ở đó không?'. Then softly start a light topic (weather, mood, music, or a small daily moment). Reply in Japanese only, 1-2 sentences.",
      "In Japanese, gently ask if the user is still there (meaning 'Bạn còn ở đó không?'), then invite them to continue with a light topic. Keep it warm and short.",
      "Reply in Japanese. First line: a soft check-in meaning 'Bạn còn ở đó không?'. Second line: a gentle topic starter. Keep it natural.",
    ];
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    return (
      prompt ??
      "Reply in Japanese only. Soft check-in meaning 'Bạn còn ở đó không?', then a gentle topic starter. 1-2 sentences."
    );
  }, []);

  const getIdleStoryPrompt = React.useCallback((): string => {
    const lastStory = lastIdleStoryRef.current;
    if (lastStory) {
      const snippet = lastStory.slice(-240);
      return `Reply in Japanese only. Continue the same personal story naturally, referencing the previous scene: "${snippet}". Two long sentences, gentle and slow, with a short pause (… or 、). No questions.`;
    }
    const prompts = [
      "Reply in Japanese only. Tell a gentle, slow self-story about your recent day (where you went, what you did, a small moment that felt nice). Two long sentences, with a short pause (… or 、) between them. No questions.",
      "Japanese only. Speak slowly and softly. Share a small personal daily-life story (a walk, a cafe, cooking, a quiet evening). Two long sentences, include a brief pause (…/、). No questions.",
      "In Japanese, narrate a calm self-story about your day (a simple routine, a soft moment, something you noticed). Two long sentences, gentle and slow, with a small pause. No questions.",
    ];
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    return (
      prompt ??
      "Reply in Japanese only. Calm self-story about your day. Two long sentences, gentle and slow, with a small pause. No questions."
    );
  }, []);

  const handleCreateConversation = () => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: "Cuộc trò chuyện mới",
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setPendingConversation(newConversation);
    setActiveConversationId(newConversation.id);
    setMobilePanelOpen(false);
  };

  const handleRenameConversation = (id: string, title: string) => {
    setConversations((prev) => prev.map((conv) => (conv.id === id ? { ...conv, title } : conv)));
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const next = prev.filter((conv) => conv.id !== id);
      if (activeConversationId === id) {
        const nextActive = next[0];
        setActiveConversationId(nextActive ? nextActive.id : null);
        setPendingConversation(null);
      }
      return next;
    });
  };

  const handleSelectConversation = React.useCallback(
    (id: string) => {
      setActiveConversationId(id);
      setMobilePanelOpen(false);
    },
    [setActiveConversationId],
  );

  const ensureConversation = React.useCallback(() => {
    if (pendingConversation && pendingConversation.id === activeConversationId) {
      return { conversation: pendingConversation, pending: true };
    }
    if (activeConversation) {
      return { conversation: activeConversation, pending: false };
    }
    const created: Conversation = {
      id: `conv-${Date.now()}`,
      title: "Cuộc trò chuyện mới",
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setConversations((prev) => [created, ...prev]);
    setActiveConversationId(created.id);
    return { conversation: created, pending: false };
  }, [activeConversation, activeConversationId, pendingConversation, setActiveConversationId]);

  const streamResponse = React.useCallback(
    async (
      message: string,
      settings: AgentSettingsType,
      conversationId: string,
      messageId: string,
      history: Array<{ role: "user" | "assistant"; content: string }> = [],
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
          body: JSON.stringify({ message, settings, history }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => null);
          const message =
            (errorPayload && typeof errorPayload.error === "string" && errorPayload.error) ||
            "Không thể kết nối MegaLLM. Kiểm tra API key hoặc endpoint.";
          throw new Error(message);
        }

        if (!response.body) {
          throw new Error("Không thể kết nối streaming.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let hasVisibleChunk = false;
        let fullAssistantMessage = "";

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
            const chunk = line.replace("data: ", "").trimEnd();
            if (chunk === "[DONE]") {
              if (idleMessageRef.current?.id === messageId) {
                if (idleMessageRef.current.mode === "story") {
                  const finalStory = idleStoryBufferRef.current.trim();
                  if (finalStory) {
                    lastIdleStoryRef.current = finalStory;
                  }
                  idleStoryBufferRef.current = "";
                }
                idleMessageRef.current = null;
              }
              if (!hasVisibleChunk) {
                appendChunk(
                  conversationId,
                  messageId,
                  "Model chưa trả về nội dung. Hãy gửi lại hoặc tăng `max_tokens` cho model hiện tại.",
                );
              }
              finalizeMessageEmotion(conversationId, messageId);
              void maybeAttachFurigana(conversationId, messageId, fullAssistantMessage);
              const leftover = speechBufferRef.current.trim();
              if (leftover) {
                enqueueSpeech(leftover, settings);
              }
              resetStream();
              return;
            }
            appendChunk(conversationId, messageId, chunk);
            if (chunk.trim().length > 0) {
              hasVisibleChunk = true;
            }
            fullAssistantMessage += chunk;
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
        if (fullAssistantMessage.trim().length > 0) {
          void maybeAttachFurigana(conversationId, messageId, fullAssistantMessage);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        if (error instanceof Error && error.message) {
          setStreamError(error.message);
          appendChunk(conversationId, messageId, `\n\n${error.message}`);
        } else {
          setStreamError("Kết nối bị gián đoạn. Vui lòng thử lại.");
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [appendChunk, enqueueSpeech, finalizeMessageEmotion, maybeAttachFurigana],
  );

  const handleSendMessage = React.useCallback(
    (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) {
        return;
      }
      lastActivityRef.current = Date.now();
      idleStageRef.current = 0;
      lastStoryAtRef.current = 0;
      idleMessageRef.current = null;
      idleStoryBufferRef.current = "";
      lastIdleStoryRef.current = "";
      speechRateMultiplierRef.current = 1;
      speechModeRef.current = "normal";
      const normalized = normalizeText(trimmed);
      const last = lastUserSentRef.current;
      const elapsed = Date.now() - last.at;
      if (last.text && elapsed < 2500) {
        if (last.text === normalized) {
          return;
        }
        const isLikelyTailDuplicate =
          normalized.length >= 2 &&
          normalized.length <= Math.max(8, Math.floor(last.text.length * 0.45)) &&
          last.text.endsWith(normalized);
        if (isLikelyTailDuplicate) {
          return;
        }
      }
      lastUserSentRef.current = { text: normalized, at: Date.now() };
      setInterimTranscript("");
      setLastUserUtterance(trimmed);
      setLastAssistantUtterance("");
      const { conversation: active, pending } = ensureConversation();
      const activeId = active.id;
      const userLine = trimmed;
      const assistantLine = "";
      const history = buildHistory(
        activeConversation?.id === activeId ? activeConversation : active,
      );

      const userMessage = createMessage(userLine, "user");
      const assistantMessage = createMessage(assistantLine, "assistant");

      setConversations((prev) => {
        const existing = prev.find((conv) => conv.id === activeId);
        const baseConversation = existing ?? active;
        const shouldRename = baseConversation.messages.length === 0;
        const updatedConversation: Conversation = {
          ...baseConversation,
          title: shouldRename ? deriveTitle(trimmed) : baseConversation.title,
          messages: [...baseConversation.messages, userMessage, assistantMessage],
          createdAt: new Date().toISOString(),
        };
        const rest = prev.filter((conv) => conv.id !== activeId);
        if (pending) {
          return [updatedConversation, ...rest];
        }
        return [updatedConversation, ...rest];
      });
      if (pending) {
        setPendingConversation(null);
      }

      streamResponse(trimmed, agentSettings, activeId, assistantMessage.id, history);
    },
    [
      activeConversation,
      agentSettings,
      buildHistory,
      deriveTitle,
      ensureConversation,
      normalizeText,
      streamResponse,
    ],
  );

  const handleInterimTranscript = React.useCallback((text: string) => {
    setInterimTranscript(text);
    if (text.trim().length > 0) {
      lastActivityRef.current = Date.now();
      idleStageRef.current = 0;
      lastStoryAtRef.current = 0;
    }
  }, []);

  React.useEffect(() => {
    if (!callActive || isStreaming || isSpeaking) {
      return;
    }
    if (!activeConversation) {
      return;
    }
    const timer = window.setInterval(() => {
      if (!callActive || isStreaming || isSpeaking) {
        return;
      }
      const idleFor = Date.now() - lastActivityRef.current;

      if (idleStageRef.current === 0 && idleFor >= 20000) {
        const assistantMessage = createMessage("", "assistant");
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversation.id
              ? { ...conv, messages: [...conv.messages, assistantMessage] }
              : conv,
          ),
        );
        idleStageRef.current = 1;
        idleMessageRef.current = { id: assistantMessage.id, mode: "prompt" };
        speechModeRef.current = "normal";
        streamResponse(
          getIdlePrompt(),
          agentSettings,
          activeConversation.id,
          assistantMessage.id,
          buildHistory(activeConversation),
        );
        return;
      }

      if (idleStageRef.current === 1 && idleFor >= 40000) {
        const assistantMessage = createMessage("", "assistant");
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversation.id
              ? { ...conv, messages: [...conv.messages, assistantMessage] }
              : conv,
          ),
        );
        idleStageRef.current = 2;
        lastStoryAtRef.current = Date.now();
        speechRateMultiplierRef.current = 0.7;
        idleMessageRef.current = { id: assistantMessage.id, mode: "story" };
        speechModeRef.current = "story";
        streamResponse(
          getIdleStoryPrompt(),
          agentSettings,
          activeConversation.id,
          assistantMessage.id,
          buildHistory(activeConversation),
        );
        return;
      }

      if (idleStageRef.current === 2) {
        const sinceStory = Date.now() - lastStoryAtRef.current;
        if (sinceStory < 30000) {
          return;
        }
        const assistantMessage = createMessage("", "assistant");
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversation.id
              ? { ...conv, messages: [...conv.messages, assistantMessage] }
              : conv,
          ),
        );
        lastStoryAtRef.current = Date.now();
        speechRateMultiplierRef.current = 0.7;
        idleMessageRef.current = { id: assistantMessage.id, mode: "story" };
        speechModeRef.current = "story";
        streamResponse(
          getIdleStoryPrompt(),
          agentSettings,
          activeConversation.id,
          assistantMessage.id,
          buildHistory(activeConversation),
        );
      }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [
    activeConversation,
    agentSettings,
    buildHistory,
    callActive,
    getIdlePrompt,
    getIdleStoryPrompt,
    isStreaming,
    isSpeaking,
    streamResponse,
  ]);

  const recognition = useSpeechRecognition({
    lang: "ja-JP",
    onFinal: handleSendMessage,
    onInterim: handleInterimTranscript,
  });

  const { supported: micSupported, start: startMic, stop: stopMic } = recognition;

  React.useEffect(() => {
    if (!micSupported) {
      return;
    }
    const shouldListen = callActive && !callMuted && !isSpeaking;
    if (shouldListen) {
      startMic();
    } else {
      stopMic();
    }
    return () => stopMic();
  }, [callActive, callMuted, isSpeaking, micSupported, startMic, stopMic]);

  React.useEffect(() => {
    if (!callActive) {
      setCallSeconds(0);
      setIsSpeaking(false);
      idleStageRef.current = 0;
      lastStoryAtRef.current = 0;
      idleMessageRef.current = null;
      idleStoryBufferRef.current = "";
      lastIdleStoryRef.current = "";
      speechRateMultiplierRef.current = 1;
      speechModeRef.current = "normal";
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
      return;
    }
    const timer = window.setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [callActive]);

  const handleStartCall = () => {
    callActiveRef.current = true;
    setCallActive(true);
    setCallMuted(false);
  };

  const handleEndCall = () => {
    callActiveRef.current = false;
    setCallActive(false);
    setCallMuted(false);
    setInterimTranscript("");
    speechQueueRef.current = [];
    speechBufferRef.current = "";
    setIsSpeaking(false);
    idleStageRef.current = 0;
    lastStoryAtRef.current = 0;
    idleMessageRef.current = null;
    idleStoryBufferRef.current = "";
    lastIdleStoryRef.current = "";
    speechRateMultiplierRef.current = 1;
    speechModeRef.current = "normal";
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
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
  const settingsOpen = Boolean(settingsAnchor);
  const handleOpenSettings = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSettingsAnchor(event.currentTarget);
  };
  const handleCloseSettings = () => setSettingsAnchor(null);

  return (
    <Box className="flex min-h-0 flex-1 flex-col">
      <Box className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <Paper
          elevation={0}
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)]"
        >
          <Box className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pt-3 sm:px-4 sm:pt-4 lg:px-6 lg:pt-6">
            <Box className="mb-3 flex items-center gap-2 lg:hidden">
              <IconButton
                size="small"
                onClick={() => setMobilePanelOpen(true)}
                aria-label="Mở danh sách hội thoại"
              >
                <ChatBubbleOutlineIcon fontSize="small" />
              </IconButton>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleCreateConversation}
                className="flex-1 justify-center rounded-full"
                sx={subtleOutlinedButtonSx}
              >
                Trò chuyện mới
              </Button>
              <IconButton
                size="small"
                onClick={handleOpenSettings}
                aria-label="Mở cài đặt hội thoại"
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
              {callActive ? (
                <Box className="flex flex-1 flex-col items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-slate-700 dark:text-slate-100 sm:text-3xl">
                      Mikaa
                    </p>
                    <p className="text-base text-slate-500 dark:text-slate-300 sm:text-lg">
                      {callTime}
                    </p>
                  </div>
                  <div className="relative flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
                    <div className="absolute h-full w-full rounded-full bg-blue-200/30 blur-lg dark:bg-white/10" />
                    <div
                      className="voice-ring"
                      style={{ "--wave-duration": `${waveDuration}s` } as React.CSSProperties}
                    >
                      {Array.from({ length: 48 }).map((_, index) => (
                        <span
                          key={`bar-${index}`}
                          className={isSpeaking ? "voice-bar is-speaking" : "voice-bar"}
                          style={
                            {
                              "--i": index,
                              "--count": 48,
                              animationDelay: `${(index % 12) * 0.08}s`,
                            } as React.CSSProperties
                          }
                        />
                      ))}
                    </div>
                    <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-sky-200 via-blue-200 to-slate-200 shadow-inner dark:from-[#4B5563] dark:via-[#6B7280] dark:to-[#9CA3AF] sm:h-36 sm:w-36">
                      <span className="h-10 w-10 rounded-full bg-white/70 dark:bg-white/30" />
                    </div>
                  </div>
                  <div className="space-y-2 text-center text-sm text-slate-500 dark:text-[var(--app-muted)]">
                    <p>
                      AI:{" "}
                      <span className="text-slate-700 dark:text-[var(--app-fg)]">
                        {lastAssistantUtterance || "…"}
                      </span>
                    </p>
                    <p>
                      Bạn:{" "}
                      <span className="text-slate-700 dark:text-[var(--app-fg)]">
                        {interimTranscript || lastUserUtterance || "…"}
                      </span>
                    </p>
                  </div>
                </Box>
              ) : (activeConversation && activeConversation.messages.length > 0) ||
                interimTranscript ? (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="chat-scroll min-h-0 flex-1 overflow-y-auto">
                    <ChatMessageList
                      messages={activeConversation?.messages ?? []}
                      draftMessage={interimTranscript}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="chat-scroll min-h-0 flex-1 overflow-y-auto">
                    <ChatEmptyState prompts={samplePrompts} onPrompt={handleSendMessage} />
                  </div>
                </div>
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
            <div className="mx-auto w-full max-w-xl shrink-0 pb-3 pt-2 sm:max-w-2xl sm:pb-4 md:max-w-3xl lg:max-w-4xl lg:pb-6">
              {callActive ? (
                <div className="mx-auto flex w-full max-w-md items-center justify-center gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-2)] px-4 py-3">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2 text-sm text-[var(--app-fg)]"
                  >
                    {callMuted ? <MicOffIcon fontSize="small" /> : <CallIcon fontSize="small" />}
                    {callMuted ? "Unmute" : "Mute"}
                  </button>
                  <button
                    type="button"
                    onClick={handleEndCall}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm text-white shadow-sm transition hover:bg-blue-700 dark:bg-slate-500 dark:hover:bg-slate-400"
                  >
                    End call
                  </button>
                </div>
              ) : (
                <ChatComposer onSend={handleSendMessage} onCall={handleStartCall} />
              )}
            </div>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          className="hidden min-h-0 w-full flex-col rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] lg:flex lg:w-[320px] lg:shrink-0"
        >
          <Box className="flex items-center gap-2 px-4 pt-4">
            <IconButton size="small" onClick={handleOpenSettings}>
              <SettingsIcon fontSize="small" />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleCreateConversation}
              className="flex-1 justify-start rounded-full"
              sx={subtleOutlinedButtonSx}
            >
              Trò chuyện mới
            </Button>
          </Box>
          <Divider className="my-4" />
          <Box className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-0">
            <ConversationList
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={handleSelectConversation}
              onRename={handleRenameConversation}
              onDelete={handleDeleteConversation}
            />
          </Box>
        </Paper>
      </Box>
      <Drawer
        anchor="right"
        open={mobilePanelOpen}
        onClose={() => setMobilePanelOpen(false)}
        PaperProps={{
          className:
            "flex h-full w-[min(88vw,360px)] flex-col border-l border-[var(--app-border)] bg-[var(--app-card)]",
        }}
      >
        <Box className="flex items-center justify-between border-b border-[var(--app-border)] px-4 py-3">
          <Typography variant="subtitle1" fontWeight={700}>
            Hội thoại
          </Typography>
          <IconButton size="small" onClick={() => setMobilePanelOpen(false)} aria-label="Đóng">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box className="flex items-center gap-2 px-4 pt-4">
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateConversation}
            className="flex-1 justify-center rounded-full"
            sx={subtleOutlinedButtonSx}
          >
            Trò chuyện mới
          </Button>
        </Box>
        <Box className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-3">
          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={handleSelectConversation}
            onRename={handleRenameConversation}
            onDelete={handleDeleteConversation}
          />
        </Box>
      </Drawer>
      <Popover
        open={settingsOpen}
        anchorEl={settingsAnchor}
        onClose={handleCloseSettings}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          className: "w-[min(90vw,320px)] rounded-3xl border p-6 shadow-xl",
          sx: {
            borderColor: "var(--app-border)",
            backgroundColor: "var(--app-card)",
            color: "var(--app-fg)",
          },
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Cấu hình hội thoại
        </Typography>
        <div className="mt-4">
          <AgentSettings settings={agentSettings} onChange={updateAgentSettings} />
        </div>
        {isStreaming && (
          <Typography variant="caption" color="text.secondary" className="mt-2 block">
            AI đang trả lời…
          </Typography>
        )}
      </Popover>
    </Box>
  );
}
