export type AgentSettings = {
  fillerFrequency: number;
  politeness: number;
  emotional: number;
  voiceName: string | null;
};

export const defaultAgentSettings: AgentSettings = {
  fillerFrequency: 45,
  politeness: 55,
  emotional: 40,
  voiceName: "Kyoko",
};
