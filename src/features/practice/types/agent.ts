export type AgentSettings = {
  fillerFrequency: number;
  politeness: number;
  emotional: number;
};

export const defaultAgentSettings: AgentSettings = {
  fillerFrequency: 45,
  politeness: 55,
  emotional: 40,
};
