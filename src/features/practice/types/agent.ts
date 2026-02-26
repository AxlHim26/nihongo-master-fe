export const proficiencyLevelOptions = [
  { value: "N5", label: "N5 - Cơ bản" },
  { value: "N4", label: "N4 - Sơ trung cấp" },
  { value: "N3", label: "N3 - Trung cấp" },
  { value: "N2", label: "N2 - Trung cao cấp" },
  { value: "N1", label: "N1 - Nâng cao" },
] as const;

export type ProficiencyLevel = (typeof proficiencyLevelOptions)[number]["value"];

export type AgentSettings = {
  proficiencyLevel: ProficiencyLevel;
  // percent, 100 = normal speed
  speechRate: number;
};

type PersistedAgentSettings = Partial<
  AgentSettings & {
    fillerFrequency: number;
    politeness: number;
    emotional: number;
    voiceName: string | null;
  }
>;

const clampSpeechRate = (value: number) => Math.min(130, Math.max(70, value));

export const defaultAgentSettings: AgentSettings = {
  proficiencyLevel: "N4",
  speechRate: 100,
};

export const normalizeAgentSettings = (settings?: PersistedAgentSettings): AgentSettings => {
  const speechRate =
    typeof settings?.speechRate === "number"
      ? clampSpeechRate(settings.speechRate)
      : defaultAgentSettings.speechRate;

  const level = settings?.proficiencyLevel;
  const validLevel =
    proficiencyLevelOptions.find((item) => item.value === level)?.value ??
    defaultAgentSettings.proficiencyLevel;

  return {
    proficiencyLevel: validLevel,
    speechRate,
  };
};
