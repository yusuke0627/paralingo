import { TranslatorGateway } from "../../application/ports/TranslatorGateway";
import { TranslationPair } from "../../domain/entities";

export class MockTranslatorGateway implements TranslatorGateway {
  async translate(text: string): Promise<TranslationPair[]> {
    // Mock translation logic: simulated split and append " [Translated]"
    const normalized = text.trim().replace(/\s*\n+\s*/g, ' ');
    const sentences = normalized
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);
    return sentences.map(s => ({
      en: s,
      ja: `${s} [翻訳済み]`
    }));
  }
}
