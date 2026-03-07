import { TranslatorGateway } from "../../application/ports/TranslatorGateway";
import { TranslationPair } from "../../domain/entities";
import { TranslationCore, TranslationResultSchema } from "../../domain/services/TranslationCore";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class OpenAITranslatorGateway implements TranslatorGateway {
  private translationCore = new TranslationCore();

  constructor(private apiKey: string) {}

  async translate(text: string): Promise<TranslationPair[]> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key is not configured.");
    }

    const sentences = this.translationCore.splitIntoSentences(text);
    if (sentences.length === 0) return [];

    const systemMessage = `You are a translation and linguistics assistant. You translate English to Japanese and provide Part-of-Speech tagging and dependency parsing.`;

    const userMessage = `
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

    let attempts = 0;
    while (attempts < 2) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemMessage },
              { role: "user", content: userMessage },
            ],
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          const error: any = new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
          error.status = response.status;
          error.body = errorBody;
          throw error;
        }

        const data = await response.json();
        let responseText = data.choices?.[0]?.message?.content || "";
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
            modelName: "gpt-4o-mini"
          }));
        }
      } catch (err: any) {
        console.warn(`OpenAI translation attempt ${attempts + 1} failed:`, err?.message || err);
        if (err?.status === 429) {
          console.warn("OpenAI rate limit hit.");
          throw err; // Propagate 429 so the orchestrator can handle it
        }
        if (attempts === 0) {
          await sleep(1000);
        }
      }
      attempts++;
    }

    // If all attempts fail, throw so orchestrator can try next provider
    throw new Error("OpenAI translation failed after retries.");
  }
}
