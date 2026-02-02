export type EmotionTag = "happy" | "sad" | "surprised" | "caring" | "shy" | "confused" | "neutral";

const matchers: Array<{ tag: EmotionTag; regex: RegExp }> = [
  { tag: "happy", regex: /嬉しい|楽しい|よかった|幸せ|わくわく|にこ/i },
  { tag: "sad", regex: /悲しい|寂しい|つらい|泣/i },
  { tag: "surprised", regex: /びっくり|驚|まじで|えっ/i },
  { tag: "caring", regex: /心配|大丈夫|無理しない|気をつけ/i },
  { tag: "shy", regex: /恥ずかし|照れ|えへへ|てれる|はずかし/i },
  { tag: "confused", regex: /わからない|むずかしい|どうしよう|迷う|うーん/i },
];

export const detectEmotionTag = (text: string): EmotionTag => {
  const normalized = text.trim();
  if (!normalized) {
    return "neutral";
  }
  const found = matchers.find((matcher) => matcher.regex.test(normalized));
  return found?.tag ?? "neutral";
};
