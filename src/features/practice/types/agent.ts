export type AgentSettings = {
  fillerFrequency: number;
  politeness: number;
  emotional: number;
  personality: number;
};

export const defaultAgentSettings: AgentSettings = {
  fillerFrequency: 45,
  politeness: 55,
  emotional: 40,
  personality: 65,
};
