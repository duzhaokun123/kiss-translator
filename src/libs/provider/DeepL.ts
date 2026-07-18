import BaseProvider, {
  BATCH_TRANSLATE_PROPS,
  BatchTranslateProps,
  DEFAULT_PROPS,
} from "./BaseProvider";
import type { BaseProviderProps } from "./BaseProvider";
import { LanguageCode, ProviderTypeValue } from "./constants";
import type { Translate, TranslateResult } from "./interfaces";
import fetch from "../fetchCompat";
import { BatchQueue } from "../batchQueue";

/**
 * DeepL API v2 text translation
 * @see https://developers.deepl.com/docs/api-reference/translate
 * Free: https://api-free.deepl.com/v2/translate
 * Pro:  https://api.deepl.com/v2/translate
 */
type DeepLProps = BaseProviderProps &
  BatchTranslateProps & {
    url: string;
    /** Authorization: DeepL-Auth-Key {key} */
    key: string;
  };

const DEEPL_DEFAULT_PROPS: DeepLProps = {
  ...DEFAULT_PROPS,
  ...BATCH_TRANSLATE_PROPS,
  type: ProviderTypeValue.deepl,
  label: "DeepL",
  icon: "DeepL",
  url: "https://api-free.deepl.com/v2/translate",
  key: "",
};

// DeepL uses uppercase codes; Chinese variants share ZH
const LANG_MAP: Partial<Record<LanguageCode, string>> = {
  "zh-CN": "ZH",
  "zh-TW": "ZH",
};

const mapLang = (code: LanguageCode): string =>
  LANG_MAP[code] ?? code.toUpperCase();

type DeepLResponse = {
  translations?: {
    text: string;
    detected_source_language?: string;
  }[];
};

class DeepL extends BaseProvider<DeepLProps> implements Translate {
  type = ProviderTypeValue.deepl;
  private batchQueue = BatchQueue(
    (
      text: string[],
      { src, dst }: { src: LanguageCode; dst: LanguageCode }
    ) => {
      return this.multiStringTranslate(text, src, dst);
    },
    {
      batchInterval: this.props.batchIntervalMs,
      batchSize: this.props.batchSize,
      batchLength: this.props.batchLength,
    }
  );

  async translate(
    text: string,
    src: LanguageCode,
    dst: LanguageCode
  ): Promise<TranslateResult> {
    return this.batchQueue.addTask(text, { src, dst });
  }

  private async multiStringTranslate(
    text: string[],
    src: LanguageCode,
    dst: LanguageCode
  ): Promise<TranslateResult[]> {
    // source_lang optional — omit for auto-detect (docs)
    const body: {
      text: string[];
      target_lang: string;
      source_lang?: string;
    } = {
      text,
      target_lang: mapLang(dst),
    };
    if (src !== "auto") {
      body.source_lang = mapLang(src);
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `DeepL-Auth-Key ${this.props.key}`,
    };

    const resp = await this.queue.add(async () =>
      fetch(this.props.url, {
        headers,
        method: "POST",
        body: JSON.stringify(body),
      })
    );
    if (!resp.ok) {
      throw new Error(`http error ${resp.status} ${resp.statusText}`);
    }
    const json: DeepLResponse = await resp.json();
    const translations = json.translations;
    if (!translations?.length) {
      throw new Error("empty translation response");
    }
    return translations.map((item) => ({
      translate: item.text,
      src: (item.detected_source_language as LanguageCode) ?? null,
    }));
  }
}

export default DeepL;
export type { DeepLProps };
export { DEEPL_DEFAULT_PROPS };
