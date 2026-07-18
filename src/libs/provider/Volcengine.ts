import BaseProvider, { DEFAULT_PROPS } from "./BaseProvider";
import type { BaseProviderProps } from "./BaseProvider";
import { LanguageCode, ProviderTypeValue } from "./constants";
import type { Translate, TranslateResult } from "./interfaces";
import fetch from "../fetchCompat";

type VolcengineProps = BaseProviderProps;

const VOLCENGINE_DEFAULT_PROPS: VolcengineProps = {
  ...DEFAULT_PROPS,
  type: ProviderTypeValue.volcengine,
  label: "Volcengine",
  icon: "Volcengine",
};

/** Browser CRX free endpoint (not signed cloud API) */
const VOLCENGINE_URL = "https://translate.volcengine.com/crx/translate/v1";

// Only non-identity mappings; others pass through as-is
const LANG_MAP: Partial<Record<LanguageCode, string>> = {
  "zh-CN": "zh",
  "zh-TW": "zh-Hant",
};

const mapLang = (code: LanguageCode): string => LANG_MAP[code] ?? code;

type VolcengineResponse = {
  translation?: string;
  detected_language?: string;
};

class Volcengine extends BaseProvider<VolcengineProps> implements Translate {
  type = ProviderTypeValue.volcengine;

  async translate(
    text: string,
    src: LanguageCode,
    dst: LanguageCode
  ): Promise<TranslateResult> {
    const body = {
      source_language: mapLang(src),
      target_language: mapLang(dst),
      text,
    };
    const headers = {
      "Content-Type": "application/json",
    };

    const resp = await this.queue.add(async () =>
      fetch(VOLCENGINE_URL, {
        headers,
        method: "POST",
        body: JSON.stringify(body),
      })
    );
    if (!resp.ok) {
      throw new Error(`http error ${resp.status} ${resp.statusText}`);
    }
    const json: VolcengineResponse = await resp.json();
    if (!json.translation) {
      throw new Error("empty translation response");
    }
    return {
      translate: json.translation,
      src: (json.detected_language as LanguageCode) ?? null,
    };
  }
}

export default Volcengine;
export type { VolcengineProps };
export { VOLCENGINE_DEFAULT_PROPS };
