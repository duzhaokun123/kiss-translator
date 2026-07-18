import BaseProvider, { DEFAULT_PROPS } from "./BaseProvider";
import type { BaseProviderProps } from "./BaseProvider";
import { LanguageCode, ProviderTypeValue } from "./constants";
import type {
  LanguageDetection,
  Translate,
  TranslateResult,
} from "./interfaces";
import { chromeDetect, chromeTranslate } from "../builtinAI";
import { isBuiltinAIAvailable } from "../browser";
import { fnPolyfill } from "../fetch";
import {
  MSG_BUILTINAI_DETECT,
  MSG_BUILTINAI_TRANSLATE,
} from "../../config";

/**
 * Browser built-in on-device Translator / LanguageDetector
 * (Chrome 138+ experimental Gemini Nano).
 * Bridged via background when called from content scripts.
 */
type BuiltinAIProps = BaseProviderProps;

const BUILTINAI_DEFAULT_PROPS: BuiltinAIProps = {
  ...DEFAULT_PROPS,
  type: ProviderTypeValue.builtinai,
  label: "BuiltinAI",
  icon: "BuiltinAI",
};

// Chrome Translator language tags
const LANG_MAP: Partial<Record<LanguageCode, string>> = {
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
};

const mapLang = (code: LanguageCode): string => LANG_MAP[code] ?? code;

/** [translatedText, sourceLanguage, errorMessage] */
type ChromeTranslateResult = [string, string, string];
/** [detectedLanguage, errorMessage] */
type ChromeDetectResult = [string, string];

// fnPolyfill is untyped rest-args JS; cast keeps call-site results typed
const polyfill = <T>(args: Record<string, unknown>): Promise<T> =>
  (fnPolyfill as (args: Record<string, unknown>) => Promise<T>)(args);

class BuiltinAI
  extends BaseProvider<BuiltinAIProps>
  implements Translate, LanguageDetection
{
  type = ProviderTypeValue.builtinai;

  async translate(
    text: string,
    src: LanguageCode,
    dst: LanguageCode
  ): Promise<TranslateResult> {
    if (!isBuiltinAIAvailable) {
      throw new Error("BuiltinAI unavailable in this browser");
    }

    const result = await this.queue.add(() =>
      polyfill<ChromeTranslateResult>({
        fn: chromeTranslate,
        msg: MSG_BUILTINAI_TRANSLATE,
        text,
        from: mapLang(src),
        to: mapLang(dst),
      })
    );

    if (!result) {
      throw new Error("empty BuiltinAI response");
    }

    const [trText, srLang, error] = result;
    if (error) {
      throw new Error(error);
    }

    return {
      translate: trText,
      src: (srLang as LanguageCode) || null,
    };
  }

  async languageDetection(text: string): Promise<LanguageCode> {
    if (!isBuiltinAIAvailable) {
      throw new Error("BuiltinAI unavailable in this browser");
    }

    const result = await this.queue.add(() =>
      polyfill<ChromeDetectResult>({
        fn: chromeDetect,
        msg: MSG_BUILTINAI_DETECT,
        text,
      })
    );

    if (!result) {
      throw new Error("empty BuiltinAI detect response");
    }

    const [lang, error] = result;
    if (error || !lang) {
      throw new Error(error || "language detection failed");
    }
    return lang as LanguageCode;
  }
}

export default BuiltinAI;
export type { BuiltinAIProps };
export { BUILTINAI_DEFAULT_PROPS };
