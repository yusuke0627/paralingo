import { TranslatorGateway } from "../../application/ports/TranslatorGateway";
import { TranslationPair } from "../../domain/entities";

export class MockTranslatorGateway implements TranslatorGateway {
  async translate(text: string): Promise<TranslationPair[]> {
    // Mock translation logic: simulated split and append " [Translated]"
    const sentences = text.split(/(?<=[.!?])\s+/);
    return sentences.map(s => ({
      en: s,
      ja: `${s} [翻訳済み]`
    }));
  }
}
