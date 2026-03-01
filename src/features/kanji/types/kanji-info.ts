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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onyomiExamples?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kunyomiExamples?: any[];
    radical?: {
      symbol?: string;
      meaning?: string;
    };
    jlptLevel?: string;
    strokeCount?: number;
  };
  amHanViet?: string;
  hanViet?: string[] | null;
  hanVietExplain?: Record<string, string>;
  meaning?: Record<string, string>;
};

export type KanjiSummary = {
  kanji: string;
  meaning: Record<string, string> | string;
  onyomi: string;
  kunyomi: string;
  jlptLevel: string;
  strokeCount: number;
  index: number;
  amHanViet?: string;
  hanViet?: string[] | null;
  hanVietExplain?: Record<string, string>;
};

export type KanjiListResponse = {
  items: KanjiSummary[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
};
