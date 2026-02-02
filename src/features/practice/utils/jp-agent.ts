import type { AgentSettings } from "@/features/practice/types/agent";

const fillers = ["えっと…", "あの…", "そうだね…", "うーん…", "なるほど…", "えへへ…", "かな〜"];

const isQuestion = (text: string) =>
  /[?？]/.test(text) || /どう|おすすめ|何|どこ|いつ|だれ/.test(text);

const isPartial = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) {
    return true;
  }
  if (/…|\.\.\.$/.test(trimmed)) {
    return true;
  }
  if (trimmed.length < 4) {
    return true;
  }
  return false;
};

const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)] ?? list[0];

const clamp = (value: number) => Math.min(100, Math.max(0, value));

const chooseStyle = (politeness: number) => {
  const normalized = clamp(politeness) / 100;
  if (normalized >= 0.65) {
    return "polite" as const;
  }
  if (normalized <= 0.35) {
    return "casual" as const;
  }
  return Math.random() > 0.5 ? ("polite" as const) : ("casual" as const);
};

const withEmotion = (base: string, emotional: number, style: "polite" | "casual") => {
  const normalized = clamp(emotional) / 100;
  if (normalized < 0.35) {
    return base;
  }
  const extras =
    style === "polite"
      ? ["なんだかいいですね。", "ちょっと嬉しいです。", "ほっとしますね。"]
      : ["なんかいいね。", "ちょっと嬉しい。", "ほっとするね。"];
  return `${base} ${pick(extras)}`;
};

const buildResponse = (message: string, settings: AgentSettings) => {
  const style = chooseStyle(settings.politeness);
  const fillerChance = clamp(settings.fillerFrequency) / 100;
  const addFiller = Math.random() < fillerChance ? `${pick(fillers)} ` : "";

  if (isPartial(message)) {
    const prompts =
      style === "polite"
        ? ["続き、聞かせてもらえますか？", "もう少し教えてもらえると嬉しいです。"]
        : ["続き、聞かせて？", "もう少し教えてくれる？"];
    return `${addFiller}${pick(prompts)}`.trim();
  }

  const topicRules = [
    {
      match: /こんにちは|こんばんは|おはよう|konnichiwa|konichiwa|konbanwa|ohayou|ohayo|hello|hi/i,
      polite: {
        base: "こんにちは。今日はどんな感じですか？",
        follow: "今ちょっと時間ありますか？",
      },
      casual: {
        base: "こんにちは。今日はどんな感じ？",
        follow: "今ちょっと時間ある？",
      },
    },
    {
      match: /天気|暑い|寒い|雨|晴れ/,
      polite: {
        base: "最近、天気が落ち着かないですね。",
        follow: "今日はどんな空模様ですか？",
      },
      casual: {
        base: "最近、天気落ち着かないね。",
        follow: "今日はどんな感じ？",
      },
    },
    {
      match: /食べ|ごはん|ランチ|ディナー|ラーメン|寿司|カフェ|コーヒー|お腹/,
      polite: {
        base: "それ聞くとお腹すきます。",
        follow: "今日は何を食べましたか？",
      },
      casual: {
        base: "それ聞くとお腹すくなあ。",
        follow: "今日は何食べた？",
      },
    },
    {
      match: /京都|大阪|東京|旅行|観光/,
      polite: {
        base: "旅行の話、いいですね。",
        follow: "行ってみたい場所はありますか？",
      },
      casual: {
        base: "旅行の話いいね。",
        follow: "行ってみたい場所ある？",
      },
    },
    {
      match: /仕事|忙しい|残業|バイト|会社/,
      polite: {
        base: "お疲れさまです。",
        follow: "今日は忙しかったですか？",
      },
      casual: {
        base: "おつかれさま。",
        follow: "今日は忙しかった？",
      },
    },
    {
      match: /映画|音楽|趣味|ゲーム|本|読書/,
      polite: {
        base: "趣味の話って楽しいですね。",
        follow: "最近ハマっているものはありますか？",
      },
      casual: {
        base: "趣味の話って楽しいね。",
        follow: "最近ハマってるものある？",
      },
    },
  ];

  const matched = topicRules.find((rule) => rule.match.test(message));
  const fallback =
    style === "polite"
      ? {
          base: "なるほど、そうなんですね。",
          follow: "それって最近のことですか？",
        }
      : {
          base: "なるほど、そうなんだ。",
          follow: "それって最近のこと？",
        };

  const { base, follow } = matched
    ? style === "polite"
      ? matched.polite
      : matched.casual
    : fallback;

  const primary = withEmotion(base, settings.emotional, style);

  const wantsQuestion = isQuestion(message);
  const length = message.length;
  const sentenceCount =
    length < 12 ? (Math.random() > 0.35 ? 1 : 2) : length < 30 ? (Math.random() > 0.6 ? 2 : 3) : 3;

  if (sentenceCount === 1) {
    const single = wantsQuestion ? primary : `${primary} ${follow}`.trim();
    return `${addFiller}${single}`.trim();
  }

  if (sentenceCount === 2) {
    return `${addFiller}${primary} ${follow}`.trim();
  }

  const extra =
    style === "polite"
      ? pick(["そういう話、もっと聞きたいです。", "ゆっくり聞かせてもらえると嬉しいです。"])
      : pick(["そういう話、もっと聞きたい。", "ゆっくり聞かせてくれると嬉しい。"]);

  return `${addFiller}${primary} ${follow} ${extra}`.trim();
};

export const generateAgentReply = (message: string, settings: AgentSettings) =>
  buildResponse(message, settings);

export const buildSystemPrompt = (settings: AgentSettings) => {
  const filler = Math.min(100, Math.max(0, settings.fillerFrequency));
  const politeness = Math.min(100, Math.max(0, settings.politeness));
  const emotional = Math.min(100, Math.max(0, settings.emotional));
  const personality = Math.min(100, Math.max(0, settings.personality));

  return `You are Mikaa, a native Japanese female (age 20-30). Speak like a real person: cute, warm, friendly, natural.
Show gentle emotions (happy, shy, surprised, caring) and react briefly before answering (e.g., うん、えっと…, そうだね…).
Use subtle fillers: えっと, あの, うん, そうだね, かな〜, えへへ. Occasionally stretch vowels like ねぇ〜 / うん〜, but not too often.
Use short pauses with "…" or "、" when thinking. Vary speaking rhythm: sometimes a bit faster, sometimes slower.
Keep replies 1-3 sentences. Avoid anime or textbook tone, avoid heavy keigo.
Always respond in Japanese only (no English).
Match response length to the user input: if the user input is short or a greeting, reply in 1 short sentence (optionally add one short follow-up question, but never long).
Vary the length naturally (sometimes 1 sentence, sometimes 2) so it feels human.
Personality control: higher personality means warmer, cuter, more affectionate; lower means more neutral and calm.
Settings: filler_frequency=${filler}/100, politeness=${politeness}/100, emotional_subtlety=${emotional}/100, personality=${personality}/100.`;
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
