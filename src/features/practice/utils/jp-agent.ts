import type { AgentSettings, ProficiencyLevel } from "@/features/practice/types/agent";

const fillers = ["えっと…", "あの…", "うん…", "そうだね…", "なるほど…"];

const pick = <T>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)] ?? list[0];

const levelPrompt: Record<ProficiencyLevel, string> = {
  N5: "Use very simple Japanese words and short basic grammar.",
  N4: "Use easy daily Japanese with short and clear sentence patterns.",
  N3: "Use natural daily Japanese with moderate complexity.",
  N2: "Use richer vocabulary and nuanced but still conversational Japanese.",
  N1: "Use highly natural, nuanced Japanese while keeping it casual and warm.",
};

export const generateAgentReply = (message: string, _settings: AgentSettings) => {
  const cleaned = message.trim();
  if (!cleaned) {
    return "うん… もう一回ゆっくり話してもらえる？";
  }

  const base = cleaned.length <= 10 ? "こんにちは。元気？" : "うん、なるほど。もう少し聞かせて？";
  const withFiller = Math.random() > 0.55 ? `${pick(fillers)} ${base}` : base;
  return withFiller.trim();
};

export const buildSystemPrompt = (settings: AgentSettings) => {
  const speechRate = Math.min(130, Math.max(70, settings.speechRate));
  return `You are Mikaa Japanese conversation assistant.
Persona:
- Native Japanese woman in her 20s, warm and natural.
- Casual + slightly polite, never robotic, never anime-style.

Response style:
- Japanese only.
- Keep most turns 1-3 sentences, with natural variation in length.
- Use subtle fillers/discourse markers only when natural (えっと, あの, うん, そうだね, なるほど).
- React to user intent directly and keep the flow conversational.
- No lectures, no grammar teaching unless user asks.
- Never output reasoning tags, meta text, or angle-bracket thinking text.

Furigana format:
- Always add furigana for kanji words in this exact format: 漢字(かんじ).
- Do not skip furigana for kanji words.

Learner profile:
- Level: ${settings.proficiencyLevel}. ${levelPrompt[settings.proficiencyLevel]}
- Target speaking speed for voice: ${speechRate}% (100% = normal).`;
};

export const chunkText = (text: string) => {
  const chars = Array.from(text);
  const chunks: string[] = [];
  let index = 0;
  while (index < chars.length) {
    const size = 2 + Math.floor(Math.random() * 4);
    chunks.push(chars.slice(index, index + size).join(""));
    index += size;
  }
  return chunks;
};
