export interface PosToken {
  text: string;
  pos: 'Noun' | 'Verb' | 'Adjective' | 'Adverb' | 'Pronoun' | 'Preposition' | 'Conjunction' | 'Interjection' | 'Article' | 'Punctuation' | 'Other';
  modifies?: number; // The index of the word this token modifies in the same sentence's posTokens array
  modificationType?: string; // e.g., "Relative Pronoun", "Adjective Modifier"
}

export interface TranslationPair {
  en: string;
  ja: string;
  posTokens?: PosToken[];
  isFallback?: boolean;
  modelName?: string; // e.g., "gemini-2.5-flash", "gpt-4o-mini"
}

export interface VocabMemo {
  id?: string;
  term: string;
  translation: string[];
  content: string[]; // List of original sentences containing the term
  createdAt: Date;
}

export type ReviewReason = 'unknown' | 'later';
export type ReviewStatus = 'pending' | 'resolved';

export interface ReviewItem {
  id?: string;
  en: string;
  ja: string;
  posTokens?: PosToken[];
  reason: ReviewReason;
  status: ReviewStatus;
  createdAt: Date;
}
