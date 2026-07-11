import type { LanguageCode } from "./constants";

type TranslateResult = { translate: string; src: LanguageCode | null };

interface Translate {
  translate(
    text: string,
    src: LanguageCode,
    dst: LanguageCode
  ): Promise<TranslateResult>;
}

interface LanguageDetection {
  languageDetection(text: string): Promise<LanguageCode>;
}

export type { TranslateResult, Translate, LanguageDetection };
