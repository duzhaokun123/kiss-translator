import type { LanguageCode } from "./constants";

type TranslateResult = { translate: string; src: LanguageCode | null };

interface SingleStingsTranslate {
  singleStringTranslate(
    text: string,
    src: LanguageCode,
    dst: LanguageCode
  ): Promise<TranslateResult>;
}

interface MultiStringTranslate {
  multiStringTranslate(
    text: string[],
    src: LanguageCode,
    dst: LanguageCode
  ): Promise<TranslateResult[]>;
}

interface LanguageDetection {
  languageDetection(text: string): Promise<LanguageCode>;
}

export type {
  TranslateResult,
  SingleStingsTranslate,
  MultiStringTranslate,
  LanguageDetection,
};
