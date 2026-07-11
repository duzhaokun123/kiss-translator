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
import queryString from "query-string";

/**
 * Azure Translator Text API v3.0
 * @see https://learn.microsoft.com/en-us/azure/ai-services/translator/text-translation/reference/v3/translate
 * @see https://learn.microsoft.com/en-us/azure/ai-services/translator/text-translation/reference/authentication
 */
type AzureAIProps = BaseProviderProps &
  BatchTranslateProps & {
    /** Global or custom endpoint path ending with /translate (api-version is appended at request time). */
    url: string;
    /** Ocp-Apim-Subscription-Key */
    key: string;
    /**
     * Ocp-Apim-Subscription-Region
     * Required for multi-service / regional resources; optional for global single-service.
     */
    region: string;
  };

const AZUREAI_DEFAULT_PROPS: AzureAIProps = {
  ...DEFAULT_PROPS,
  ...BATCH_TRANSLATE_PROPS,
  type: ProviderTypeValue.azureai,
  label: "AzureAI",
  icon: "AzureAI",
  // Official global endpoint (api-version required)
  url: "https://api.cognitive.microsofttranslator.com/translate",
  key: "",
  region: "",
};

// Azure language codes differ from app codes for Chinese variants only.
// auto is not a language code — omit `from` for autodetection (docs).
const LANG_MAP: Partial<Record<LanguageCode, string>> = {
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
};

const mapLang = (code: LanguageCode): string => LANG_MAP[code] ?? code;

type AzureAIResponseItem = {
  translations: { text: string; to: string }[];
  detectedLanguage?: { language: string; score: number };
};

class AzureAI extends BaseProvider<AzureAIProps> implements Translate {
  type = ProviderTypeValue.azureai;
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
    // Required: api-version=3.0, to; Optional: from (omit when auto = auto-detect)
    const query: Record<string, string> = {
      "api-version": "3.0",
      to: mapLang(dst),
    };
    if (src !== "auto") {
      query.from = mapLang(src);
    }

    const url = queryString.stringifyUrl({ url: this.props.url, query });

    const headers: Record<string, string> = {
      "Content-Type": "application/json; charset=UTF-8",
      "Ocp-Apim-Subscription-Key": this.props.key,
    };
    // Region only for multi-service / regional resources (omit for global)
    if (this.props.region?.trim()) {
      headers["Ocp-Apim-Subscription-Region"] = this.props.region.trim();
    }

    // Body: JSON array of { Text } objects (docs accept Text/text)
    const body = text.map((item) => ({ Text: item }));
    const resp = await this.queue.add(async () =>
      fetch(url, {
        headers,
        method: "POST",
        body: JSON.stringify(body),
      })
    );
    if (!resp.ok) {
      throw new Error(`http error ${resp.status} ${resp.statusText}`);
    }
    const json: AzureAIResponseItem[] = await resp.json();
    return json.map((item) => ({
      translate: item.translations.map((t) => t.text).join(" "),
      // detectedLanguage only present when from is omitted (auto-detect)
      src: (item.detectedLanguage?.language as LanguageCode) ?? null,
    }));
  }
}

export default AzureAI;
export type { AzureAIProps };
export { AZUREAI_DEFAULT_PROPS };
