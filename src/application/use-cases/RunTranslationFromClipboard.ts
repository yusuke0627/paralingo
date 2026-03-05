import { ClipboardPort } from "../ports/ClipboardPort";
import { TranslatorGateway } from "../ports/TranslatorGateway";
import { TranslationPair } from "../../domain/entities";

export class RunTranslationFromClipboard {
  constructor(
    private clipboardPort: ClipboardPort,
    private translatorGateway: TranslatorGateway
  ) {}

  async execute(): Promise<TranslationPair[]> {
    const text = await this.clipboardPort.readText();
    if (!text || text.trim().length === 0) {
      throw new Error("Clipboard is empty or contains no valid text.");
    }

    const translations = await this.translatorGateway.translate(text);
    return translations;
  }
}
