import BaseProvider, { DEFAULT_PROPS } from "./BaseProvider";
import type { BaseProviderProps } from "./BaseProvider";
import { LanguageCode, ProviderTypeValue } from "./constants";
import type { Translate, TranslateResult } from "./interfaces";
import fetch from "../fetchCompat";

/**
 * Cloudflare Workers AI translation models (REST run endpoint).
 * @see https://developers.cloudflare.com/workers-ai/
 * Sync: POST { text, target_lang, source_lang? } — text is a single string.
 * Model is selected via `url` (account + model path); default is m2m100-1.2b.
 */
type CloudflareAIProps = BaseProviderProps & {
  /** Full AI run URL: /accounts/{id}/ai/run/{model} */
  url: string;
  /** Authorization: Bearer {token} */
  key: string;
};

const CLOUDFLAREAI_DEFAULT_PROPS: CloudflareAIProps = {
  ...DEFAULT_PROPS,
  type: ProviderTypeValue.cloudflareai,
  label: "CloudflareAI",
  icon: "CloudflareAI",
  url: "https://api.cloudflare.com/client/v4/accounts/{{ACCOUNT_ID}}/ai/run/@cf/meta/m2m100-1.2b",
  key: "",
};

// Short codes; no true auto-detect — API defaults source_lang to en
const LANG_MAP: Partial<Record<LanguageCode, string>> = {
  auto: "en",
  "zh-CN": "zh",
  "zh-TW": "zh",
};

const mapLang = (code: LanguageCode): string => LANG_MAP[code] ?? code;

type CloudflareAIResponse = {
  result?: {
    translated_text?: string;
  };
};

class CloudflareAI
  extends BaseProvider<CloudflareAIProps>
  implements Translate
{
  type = ProviderTypeValue.cloudflareai;

  async translate(
    text: string,
    src: LanguageCode,
    dst: LanguageCode
  ): Promise<TranslateResult> {
    const body = {
      text,
      source_lang: mapLang(src),
      target_lang: mapLang(dst),
    };
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.props.key}`,
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
    const json: CloudflareAIResponse = await resp.json();
    const translated = json.result?.translated_text;
    if (!translated) {
      throw new Error("empty translation response");
    }
    return {
      translate: translated,
      src: null,
    };
  }
}

export default CloudflareAI;
export type { CloudflareAIProps };
export { CLOUDFLAREAI_DEFAULT_PROPS };
