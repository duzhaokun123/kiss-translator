import BaseProvider, {
  BATCH_TRANSLATE_PROPS,
  BatchTranslateProps,
  DEFAULT_PROPS,
} from "./BaseProvider";
import type { BaseProviderProps } from "./BaseProvider";
import { LanguageCode, ProviderTypeValue } from "./constants";
import type {
  LanguageDetection,
  Translate,
  TranslateResult,
} from "./interfaces";
import fetch from "../fetchCompat";
import { BatchQueue } from "../batchQueue";
import { apiTencentLangdetect } from "../../apis";
import { DEFAULT_USER_AGENT } from "../../config";

type TencentProps = BaseProviderProps & BatchTranslateProps;

const TENCENT_DEFAULT_PROPS: TencentProps = {
  ...DEFAULT_PROPS,
  ...BATCH_TRANSLATE_PROPS,
  type: ProviderTypeValue.tencent,
  label: "Tencent",
  icon: "Tencent",
};

/** Transmart (腾讯翻译君网页端) */
const TENCENT_URL = "https://transmart.qq.com/api/imt";
const CLIENT_KEY =
  "browser-chrome-110.0.0-Mac OS-df4bd4c5-a65d-44b2-a40f-42f34f3535f2-1677486696487";

// Only non-identity mappings; others pass through as-is (api.js had full map with duplicates)
const LANG_MAP: Partial<Record<LanguageCode, string>> = {
  "zh-CN": "zh",
  "zh-TW": "zh",
  fi: "fil",
};

const mapLang = (code: LanguageCode): string => LANG_MAP[code] ?? code;

type TencentTranslateResponse = {
  auto_translation?: string[];
  src_lang?: string;
};

class Tencent
  extends BaseProvider<TencentProps>
  implements Translate, LanguageDetection
{
  type = ProviderTypeValue.tencent;
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
    const body = {
      header: {
        fn: "auto_translation",
        client_key: CLIENT_KEY,
      },
      type: "plain",
      model_category: "normal",
      source: {
        text_list: text,
        lang: mapLang(src),
      },
      target: {
        lang: mapLang(dst),
      },
    };
    const headers = {
      "Content-Type": "application/json",
      "user-agent": DEFAULT_USER_AGENT,
      referer: "https://transmart.qq.com/zh-CN/index",
    };

    const resp = await this.queue.add(async () =>
      fetch(TENCENT_URL, {
        headers,
        method: "POST",
        body: JSON.stringify(body),
      })
    );
    if (!resp.ok) {
      throw new Error(`http error ${resp.status} ${resp.statusText}`);
    }
    const json: TencentTranslateResponse = await resp.json();
    const translations = json.auto_translation;
    if (!translations?.length) {
      throw new Error("empty translation response");
    }
    const detected = (json.src_lang as LanguageCode) ?? null;
    return translations.map((item) => ({
      translate: item,
      src: detected,
    }));
  }

  languageDetection(text: string): Promise<LanguageCode> {
    return apiTencentLangdetect(text) as Promise<LanguageCode>;
  }
}

export default Tencent;
export type { TencentProps };
export { TENCENT_DEFAULT_PROPS };
