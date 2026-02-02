import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AgentSettings } from "@/features/practice/types/agent";
import { defaultAgentSettings } from "@/features/practice/types/agent";
import type { Conversation } from "@/features/practice/types/practice";
import storage from "@/shared/utils/storage";

type PracticeState = {
  activeConversationId: Conversation["id"] | null;
  draft: string;
  agentSettings: AgentSettings;
  setActiveConversationId: (id: Conversation["id"] | null) => void;
  setDraft: (value: string) => void;
  clearDraft: () => void;
  setAgentSettings: (settings: AgentSettings) => void;
  updateAgentSettings: (settings: Partial<AgentSettings>) => void;
};

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set) => ({
      activeConversationId: null,
      draft: "",
      agentSettings: defaultAgentSettings,
      setActiveConversationId: (id) => set({ activeConversationId: id }),
      setDraft: (value) => set({ draft: value }),
      clearDraft: () => set({ draft: "" }),
      setAgentSettings: (settings) => set({ agentSettings: settings }),
      updateAgentSettings: (settings) =>
        set((state) => ({ agentSettings: { ...state.agentSettings, ...settings } })),
    }),
    {
      name: "practice-settings",
      storage,
      partialize: (state) => ({
        agentSettings: state.agentSettings,
        activeConversationId: state.activeConversationId,
      }),
      merge: (persisted, current) => {
        const incoming = persisted as Partial<PracticeState>;
        return {
          ...current,
          ...incoming,
          agentSettings: {
            ...current.agentSettings,
            ...(incoming.agentSettings ?? {}),
          },
        };
      },
    },
  ),
);
