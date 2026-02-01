import { create } from "zustand";

import type { AgentSettings } from "@/features/practice/types/agent";
import { defaultAgentSettings } from "@/features/practice/types/agent";
import type { Conversation } from "@/features/practice/types/practice";

type PracticeState = {
  activeConversationId: Conversation["id"] | null;
  draft: string;
  agentSettings: AgentSettings;
  setActiveConversationId: (id: Conversation["id"]) => void;
  setDraft: (value: string) => void;
  clearDraft: () => void;
  setAgentSettings: (settings: AgentSettings) => void;
  updateAgentSettings: (settings: Partial<AgentSettings>) => void;
};

export const usePracticeStore = create<PracticeState>((set) => ({
  activeConversationId: null,
  draft: "",
  agentSettings: defaultAgentSettings,
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setDraft: (value) => set({ draft: value }),
  clearDraft: () => set({ draft: "" }),
  setAgentSettings: (settings) => set({ agentSettings: settings }),
  updateAgentSettings: (settings) =>
    set((state) => ({ agentSettings: { ...state.agentSettings, ...settings } })),
}));
