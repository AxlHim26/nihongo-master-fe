export type KanjiExample = {
  japanese: string;
  meaning: {
    english?: string;
    vietnamese?: string;
  };
  audio?: {
    mp3?: string;
    ogg?: string;
    aac?: string;
    opus?: string;
  };
};

export type KanjiInfo = {
  id: string;
  kanjialiveData?: {
    meaning?: string;
    onyomi_ja?: string;
    kunyomi_ja?: string;
    kunyomi?: string;
    onyomi?: string;
    examples?: KanjiExample[];
    radical?: {
      character?: string;
      strokes?: number;
      name?: {
        hiragana?: string;
        romaji?: string;
      };
      meaning?: {
        english?: string;
        vietnamese?: string;
      };
      position?: {
        hiragana?: string;
        romaji?: string;
        icon?: string;
      };
      animation?: string[];
    };
  };
  jishoData?: {
    meaning?: string;
    onyomi?: string[];
    kunyomi?: string[];
    radical?: {
      symbol?: string;
      meaning?: string;
    };
    jlptLevel?: string;
    strokeCount?: number;
  };
};
