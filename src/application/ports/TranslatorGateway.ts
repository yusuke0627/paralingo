import { TranslationPair } from "../../domain/entities";

export interface TranslatorGateway {
  translate(text: string): Promise<TranslationPair[]>;
}
