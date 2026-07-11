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
import { msAuth } from "../auth";
import { apiMicrosoftLangdetect } from "../../apis";
import queryString from "query-string";

type MicrosoftProps = BaseProviderProps & BatchTranslateProps;

const MICROSOFT_DEFAULT_PROPS: MicrosoftProps = {
  ...DEFAULT_PROPS,
  ...BATCH_TRANSLATE_PROPS,
  type: ProviderTypeValue.microsoft,
  label: "Microsoft",
  icon: "Microsoft",
};

const MICROSOFT_URL =
  "https://api-edge.cognitive.microsofttranslator.com/translate";

const LANG_MAP: Partial<Record<LanguageCode, string>> = {
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
};

const mapLang = (code: LanguageCode): string => LANG_MAP[code] ?? code;

type MicrosoftResponseItem = {
  translations: { text: string; to: string }[];
  detectedLanguage?: { language: string; score: number };
};

class Microsoft
  extends BaseProvider<MicrosoftProps>
  implements Translate, LanguageDetection
{
  type = ProviderTypeValue.microsoft;
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
    const token = await msAuth();
    if (!token) {
      throw new Error("got msauth error");
    }

    const query: Record<string, string> = {
      to: mapLang(dst),
      "api-version": "3.0",
    };
    if (src !== "auto") {
      query.from = mapLang(src);
    }

    const url = queryString.stringifyUrl({
      url: MICROSOFT_URL,
      query,
    });
    const headers = {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    };
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
    const json: MicrosoftResponseItem[] = await resp.json();
    return json.map((item) => ({
      translate: item.translations.map((t) => t.text).join(" "),
      src: (item.detectedLanguage?.language as LanguageCode) ?? null,
    }));
  }

  languageDetection(text: string): Promise<LanguageCode> {
    return apiMicrosoftLangdetect(text) as Promise<LanguageCode>;
  }
}

export default Microsoft;
export type { MicrosoftProps };
export { MICROSOFT_DEFAULT_PROPS };
