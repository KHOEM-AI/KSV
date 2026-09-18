// global-195-vocabulary.ts

export type GlobalVocabularyEntry = {
  term: string;
  language: string;
  countries: string[];
  category: string;
  aliases?: string[];
};

export const GLOBAL_195_VOCABULARY: readonly GlobalVocabularyEntry[] = [
  // Cambodia / Khmer
  {
    term: "សួស្តី",
    language: "km",
    countries: ["KH"],
    category: "greeting",
    aliases: ["សួស្ដី"],
  },

  // English
  {
    term: "hello",
    language: "en",
    countries: ["US", "GB", "CA", "AU"],
    category: "greeting",
    aliases: ["hi", "hey"],
  },

  // ...
];

export function getLanguageByCode(
  language: string,
): GlobalVocabularyEntry | undefined {
  return GLOBAL_195_VOCABULARY.find((entry) => entry.language === language);
}
