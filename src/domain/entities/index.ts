export interface TranslationPair {
  en: string;
  ja: string;
}

export interface VocabMemo {
  id?: string;
  term: string;
  translation: string[];
  content: string[]; // List of original sentences containing the term
  createdAt: Date;
}
