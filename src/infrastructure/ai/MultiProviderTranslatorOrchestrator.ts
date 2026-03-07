import { TranslatorGateway } from "../../application/ports/TranslatorGateway";
import { TranslationPair } from "../../domain/entities";
import { SettingsRepository } from "../../application/ports/SettingsRepository";
import { GeminiTranslatorGateway } from "./GeminiTranslatorGateway";
import { OpenAITranslatorGateway } from "./OpenAITranslatorGateway";
import { TranslationCore } from "../../domain/services/TranslationCore";

/**
 * Orchestrates multiple AI translation providers with:
 * - Round-robin when both keys are available
 * - Automatic failover on 429 rate limits
 * - Final fallback to Google Translate web API
 */
export class MultiProviderTranslatorOrchestrator implements TranslatorGateway {
  private lastUsedProvider: 'gemini' | 'openai' = 'openai'; // Start with openai so first call goes to gemini
  private translationCore = new TranslationCore();

  constructor(private settingsRepository: SettingsRepository) {}

  async translate(text: string): Promise<TranslationPair[]> {
    const settings = await this.settingsRepository.getSettings();
    const hasGemini = !!settings.apiKey;
    const hasOpenAI = !!settings.openaiApiKey;

    // Build the ordered list of providers to try
    const providers = this.buildProviderOrder(settings.aiProvider, hasGemini, hasOpenAI, settings);

    for (const provider of providers) {
      try {
        console.log(`[Orchestrator] Trying provider: ${provider.name}`);
        const result = await provider.gateway.translate(text);
        this.lastUsedProvider = provider.name as any;
        return result;
      } catch (err: any) {
        console.warn(`[Orchestrator] Provider ${provider.name} failed:`, err?.message || err);
        // Continue to next provider
      }
    }

    // All AI providers failed — ultimate fallback to Google Translate Web
    console.warn("[Orchestrator] All AI providers failed. Falling back to Google Translate Web API.");
    return this.webTranslateFallback(text);
  }

  private buildProviderOrder(
    mode: string,
    hasGemini: boolean,
    hasOpenAI: boolean,
    settings: any
  ): { name: string; gateway: TranslatorGateway }[] {
    const providers: { name: string; gateway: TranslatorGateway }[] = [];

    if (mode === 'gemini' && hasGemini) {
      providers.push({ name: 'gemini', gateway: new GeminiTranslatorGateway(this.settingsRepository) });
      if (hasOpenAI) {
        providers.push({ name: 'openai', gateway: new OpenAITranslatorGateway(settings.openaiApiKey) });
      }
    } else if (mode === 'chatgpt' && hasOpenAI) {
      providers.push({ name: 'openai', gateway: new OpenAITranslatorGateway(settings.openaiApiKey) });
      if (hasGemini) {
        providers.push({ name: 'gemini', gateway: new GeminiTranslatorGateway(this.settingsRepository) });
      }
    } else if (mode === 'auto') {
      // Round-robin: alternate between gemini and openai
      if (hasGemini && hasOpenAI) {
        const nextProvider = this.lastUsedProvider === 'gemini' ? 'openai' : 'gemini';
        if (nextProvider === 'gemini') {
          providers.push({ name: 'gemini', gateway: new GeminiTranslatorGateway(this.settingsRepository) });
          providers.push({ name: 'openai', gateway: new OpenAITranslatorGateway(settings.openaiApiKey) });
        } else {
          providers.push({ name: 'openai', gateway: new OpenAITranslatorGateway(settings.openaiApiKey) });
          providers.push({ name: 'gemini', gateway: new GeminiTranslatorGateway(this.settingsRepository) });
        }
      } else if (hasGemini) {
        providers.push({ name: 'gemini', gateway: new GeminiTranslatorGateway(this.settingsRepository) });
      } else if (hasOpenAI) {
        providers.push({ name: 'openai', gateway: new OpenAITranslatorGateway(settings.openaiApiKey) });
      }
    } else {
      // Fallback: try whatever is available
      if (hasGemini) {
        providers.push({ name: 'gemini', gateway: new GeminiTranslatorGateway(this.settingsRepository) });
      }
      if (hasOpenAI) {
        providers.push({ name: 'openai', gateway: new OpenAITranslatorGateway(settings.openaiApiKey) });
      }
    }

    return providers;
  }

  private async webTranslateFallback(text: string): Promise<TranslationPair[]> {
    const sentences = this.translationCore.splitIntoSentences(text);
    const results: TranslationPair[] = [];

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ja&dt=t&q=${encodeURIComponent(trimmed)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Web Translation failed: ${response.status}`);
        const data = await response.json();
        let translatedText = '';
        if (data && data[0] && Array.isArray(data[0])) {
          translatedText = data[0].map((segment: any) => segment[0]).join('');
        }
        results.push({ en: trimmed, ja: translatedText || "[Translation failed]", isFallback: true });
      } catch (e) {
        console.error("Web Fallback Translation failed:", e);
        results.push({ en: trimmed, ja: "[Translation failed]", isFallback: true });
      }
    }
    return results;
  }
}
