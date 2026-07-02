import { LanguageCode } from "./index";

type TranslateResult = { translate: string; src: LanguageCode };

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

interface LanguageIdentification {
  languageIdentification(text: string): Promise<LanguageCode>;
}

export type {
  TranslateResult,
  SingleStingsTranslate,
  MultiStringTranslate,
  LanguageIdentification,
};
