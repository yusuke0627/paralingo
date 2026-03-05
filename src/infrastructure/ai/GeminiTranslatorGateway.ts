import { GoogleGenerativeAI } from "@google/generative-ai";
import { TranslatorGateway } from "../../application/ports/TranslatorGateway";
import { TranslationPair } from "../../domain/entities";
import { TranslationCore, TranslationResultSchema } from "../../domain/services/TranslationCore";
import { SettingsRepository } from "../../application/ports/SettingsRepository";

export class GeminiTranslatorGateway implements TranslatorGateway {
  private translationCore = new TranslationCore();

  constructor(private settingsRepository: SettingsRepository) {}

  async translate(text: string): Promise<TranslationPair[]> {
    const settings = await this.settingsRepository.getSettings();
    if (!settings.apiKey) {
      throw new Error("Gemini API key is not configured. Please set it in preferences.");
    }

    const sentences = this.translationCore.splitIntoSentences(text);
    if (sentences.length === 0) return [];

    const genAI = new GoogleGenerativeAI(settings.apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Fast model preferred for inline translating

    const prompt = `
Translate the following English sentences into Japanese.
You MUST return the output as a valid JSON object matching exactly this schema:
{
  "sentences": [
    { "en": "Original English sentence", "ja": "Japanese translation" }
  ]
}

CRITICAL RULES:
1. Do not merge or split sentences. You must return exactly ${sentences.length} entries.
2. The "en" field must exactly match the input sentences below.
3. Your output must be ONLY valid JSON. Do NOT include markdown formatting (like \`\`\`json).

Input Sentences:
${sentences.map((s, i) => `[${i + 1}] ${s}`).join("\\n")}
    `;

    let attempts = 0;
    while (attempts < 2) {
      try {
        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        
        responseText = responseText.replace(/\`\`\`json\n?|\`\`\`/g, '').trim();

        const json = JSON.parse(responseText);
        const parsed = TranslationResultSchema.parse(json);

        if (this.translationCore.validate(text, parsed)) {
          // Force alignment to original separated sentences just in case
          return parsed.sentences.map((s, i) => ({
            en: sentences[i] || s.en,
            ja: s.ja
          }));
        }
      } catch (err) {
        console.warn(`Gemini translation attempt ${attempts + 1} failed or schema invalid:`, err);
      }
      attempts++;
    }

    console.warn("Falling back to individual sentence translation.");
    return this.fallbackTranslate(model, sentences);
  }

  private async fallbackTranslate(model: any, sentences: string[]): Promise<TranslationPair[]> {
    const results: TranslationPair[] = [];
    for (const sentence of sentences) {
      try {
        const prompt = \`Translate exactly this English sentence to Japanese. Output ONLY the Japanese translation, nothing else.\\n\\nEnglish: \${sentence}\`;
        const result = await model.generateContent(prompt);
        const ja = result.response.text().trim();
        results.push({ en: sentence, ja });
      } catch (e) {
        results.push({ en: sentence, ja: "[Translation failed]" });
      }
    }
    return results;
  }
}
