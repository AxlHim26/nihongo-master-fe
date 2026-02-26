export const pickPreferredJapaneseFemaleVoice = (voices: SpeechSynthesisVoice[]) => {
  if (!voices.length) {
    return null;
  }

  const japaneseVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("ja"));
  if (!japaneseVoices.length) {
    return voices[0] ?? null;
  }

  const exactFemalePriority = [
    "Google 日本語",
    "Google Japanese",
    "Kyoko",
    "Haruka",
    "Hina",
    "Hana",
    "Nanami",
    "Sayaka",
    "O-ren",
  ];

  for (const name of exactFemalePriority) {
    const matched = japaneseVoices.find((voice) => voice.name === name);
    if (matched) {
      return matched;
    }
  }

  const femaleHints = [
    "female",
    "woman",
    "girl",
    "kyoko",
    "haruka",
    "hina",
    "hana",
    "nanami",
    "sayaka",
  ];
  const maleHints = ["male", "man", "boy", "otoya", "keita", "takumi"];

  const femaleJapanese = japaneseVoices.find((voice) => {
    const name = voice.name.toLowerCase();
    return femaleHints.some((hint) => name.includes(hint));
  });
  if (femaleJapanese) {
    return femaleJapanese;
  }

  const nonMaleJapanese = japaneseVoices.find((voice) => {
    const name = voice.name.toLowerCase();
    return !maleHints.some((hint) => name.includes(hint));
  });
  if (nonMaleJapanese) {
    return nonMaleJapanese;
  }

  return japaneseVoices[0] ?? voices[0] ?? null;
};

const waitForVoices = (synth: SpeechSynthesis, timeoutMs: number) =>
  new Promise<void>((resolve) => {
    let resolved = false;
    const done = () => {
      if (resolved) {
        return;
      }
      resolved = true;
      synth.removeEventListener("voiceschanged", onVoicesChanged);
      resolve();
    };
    const onVoicesChanged = () => done();

    synth.addEventListener("voiceschanged", onVoicesChanged);
    setTimeout(done, timeoutMs);
  });

export const getPreferredJapaneseFemaleVoice = async () => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  const synth = window.speechSynthesis;
  let voices = synth.getVoices();
  if (!voices.length) {
    await waitForVoices(synth, 1200);
    voices = synth.getVoices();
  }
  return pickPreferredJapaneseFemaleVoice(voices);
};
