import { z } from "zod";
import { TranslationPair } from "../entities";

export const TranslationResultSchema = z.object({
  sentences: z.array(
    z.object({
      en: z.string(),
      ja: z.string(),
      posTokens: z.array(
        z.object({
          text: z.string(),
          pos: z.enum(['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun', 'Preposition', 'Conjunction', 'Interjection', 'Article', 'Punctuation', 'Other']),
          modifies: z.number().optional(),
          modificationType: z.string().optional()
        })
      ).optional(),
    })
  ),
});

export type TranslationResult = z.infer<typeof TranslationResultSchema>;

export class TranslationCore {
  /**
   * Validates if the translation result matches the source sentence count and structure.
   */
  validate(sourceText: string, result: TranslationResult): boolean {
    // For MVP, we might want to split sourceText into sentences and compare counts
    // However, the LLM might split sentences differently.
    // The strict rule is: "LLM should return same number of entries as what we expect or what it processed"
    
    // Minimal validation: check if result is empty
    if (result.sentences.length === 0) return false;
    
    return true;
  }

  /**
   * Split text into sentences (using simple rules for now).
   * In a real app, use Intl.Segmenter.
   */
  splitIntoSentences(text: string): string[] {
    if (!text) return [];
    const normalized = text.trim().replace(/\s*\n+\s*/g, ' ');
    if (!normalized) return [];
    // Basic regex for sentence splitting
    return normalized
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);
  }
}
