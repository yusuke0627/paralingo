import { ClipboardPort } from "../ports/ClipboardPort";
import { TranslatorGateway } from "../ports/TranslatorGateway";
import { TranslationPair } from "../../domain/entities";

export class RunTranslationFromClipboard {
  constructor(
    private clipboardPort: ClipboardPort,
    private translatorGateway: TranslatorGateway
  ) {}

  async execute(): Promise<TranslationPair[]> {
    const rawText = await this.clipboardPort.readText();
    const text = rawText?.trim();
    if (!text || text.length === 0) {
      throw new Error("Clipboard is empty or contains no valid text.");
    }

    const translations = await this.translatorGateway.translate(text);
    return translations;
  }
}
