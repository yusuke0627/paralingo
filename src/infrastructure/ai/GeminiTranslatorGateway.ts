import { GoogleGenerativeAI } from "@google/generative-ai";
import { TranslatorGateway } from "../../application/ports/TranslatorGateway";
import { TranslationPair } from "../../domain/entities";
import { TranslationCore, TranslationResultSchema } from "../../domain/services/TranslationCore";
import { SettingsRepository } from "../../application/ports/SettingsRepository";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class GeminiTranslatorGateway implements TranslatorGateway {
  private translationCore = new TranslationCore();

  constructor(private settingsRepository: SettingsRepository) {}

  private static blockedModels: Map<string, number> = new Map(); // modelName -> blockExpiryTimestamp

  async translate(text: string): Promise<TranslationPair[]> {
    const settings = await this.settingsRepository.getSettings();
    if (!settings.apiKey) {
      throw new Error("Gemini API key is not configured. Please set it in preferences.");
    }

    const sentences = this.translationCore.splitIntoSentences(text);
    if (sentences.length === 0) return [];

    const genAI = new GoogleGenerativeAI(settings.apiKey);
    const prompt = `
Translate the following English sentences into Japanese.
Also, perform Part-of-Speech tagging and basic dependency parsing on the English sentence. Break down the English sentence into tokens (including punctuation and spaces as separate tokens if necessary so the original sentence can be reconstructed).

You MUST return the output as a valid JSON object matching exactly this schema:
{
  "sentences": [
    { 
      "en": "Original English sentence", 
      "ja": "Japanese translation",
      "posTokens": [
        { 
          "text": "WordOrPunctuation", 
          "pos": "Noun|Verb|Adjective|Adverb|Pronoun|Preposition|Conjunction|Interjection|Article|Punctuation|Other",
          "modifies": 0,
          "modificationType": "Relative Pronoun|Adjective Modifier|... (optional)"
        }
      ]
    }
  ]
}

CRITICAL RULES:
1. Do not merge or split sentences. You must return exactly ${sentences.length} entries.
2. The "pos" field MUST STRICTLY BE ONE OF: "Noun", "Verb", "Adjective", "Adverb", "Pronoun", "Preposition", "Conjunction", "Interjection", "Article", "Punctuation", or "Other".
3. The "en" field must exactly match the input sentences below.
4. The concatenation of "text" in "posTokens" must exactly reconstruct the "en" sentence, including spaces and punctuation. Use "Other" for whitespace if needed.
5. Your output must be ONLY valid JSON. Do NOT include markdown formatting (like \`\`\`json).
6. If a token modifies another token, set "modifies" to the target token index in the SAME sentence's posTokens array (0-based index).
7. If "modifies" is set, include "modificationType" (for example: "Relative Pronoun", "Adjective Modifier", "Adverbial Modifier", "Object").
8. If a token has no clear modifier relation, omit "modifies" and "modificationType".


Input Sentences:
${sentences.map((s, i) => `[${i + 1}] ${s}`).join("\\n")}
    `;

    const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-flash-latest"];
    const now = Date.now();

    for (const modelName of modelsToTry) {
      // Check if model is blocked by daily quota
      const expiry = GeminiTranslatorGateway.blockedModels.get(modelName);
      if (expiry && now < expiry) {
        console.log(`[Gemini] Skipping blocked model ${modelName} (daily quota expired)`);
        continue;
      }

      try {
        console.log(`[Gemini] Attempting translation with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        let attempts = 0;
        while (attempts < 2) {
          try {
            const result = await model.generateContent(prompt);
            let responseText = result.response.text();
            responseText = responseText.replace(/```json\n?|```/g, '').trim();

            let json = JSON.parse(responseText);
            if (Array.isArray(json)) {
              json = { sentences: json };
            }
            const parsed = TranslationResultSchema.parse(json);

            if (this.translationCore.validate(text, parsed)) {
              return parsed.sentences.map((s, i) => ({
                en: sentences[i] || s.en,
                ja: s.ja,
                posTokens: s.posTokens,
                modelName: modelName // Include used model name
              }));
            }
          } catch (err: any) {
            const message = err?.message || String(err);
            console.warn(`[Gemini] Model ${modelName} attempt ${attempts + 1} failed:`, message);

            // Detailed quota check
            if (message.includes("429") || err?.status === 429) {
              // Check if it's a daily limit
              if (message.toLowerCase().includes("perday") || message.toLowerCase().includes("daily")) {
                console.warn(`[Gemini] DAILY Quota exceeded for ${modelName}. Blocking for 12 hours.`);
                GeminiTranslatorGateway.blockedModels.set(modelName, Date.now() + 12 * 60 * 60 * 1000);
              }
              console.warn(`[Gemini] Model ${modelName} is throttled. Trying next model...`);
              throw err; // Break inner loop to try next model in the outer loop catch
            }

            if (attempts === 0) {
              await sleep(1000);
            }
          }
          attempts++;
        }
      } catch (err: any) {
        // Outer loop catch — either inner 429 propogated or initialization failed
        continue; // Try next model name
      }
    }

    // All Gemini models failed — throw so orchestrator can handle next provider or web fallback
    throw new Error("All Gemini models failed (including 429 or other errors).");
  }
}
