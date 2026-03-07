import { TranslatorGateway } from "../../application/ports/TranslatorGateway";
import { TranslationPair } from "../../domain/entities";
import { TranslationCore } from "../../domain/services/TranslationCore";

export class MockTranslatorGateway implements TranslatorGateway {
  private translationCore = new TranslationCore();

  async translate(text: string): Promise<TranslationPair[]> {
    // Mock translation logic: simulated split and append " [Translated]"
    const sentences = this.translationCore.splitIntoSentences(text);
    return sentences.map(s => ({
      en: s,
      ja: `${s} [翻訳済み]`
    }));
  }
}
