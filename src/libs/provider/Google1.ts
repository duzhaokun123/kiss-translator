import BaseProvider, {
  BaseProviderProps,
  DEFAULT_PROPS as BASE_DEFAULT_PROPS,
} from "./BaseProvider";
import { LanguageCode, ProviderType } from "./index";
import {
  LanguageDetection,
  SingleStingsTranslate,
  TranslateResult,
} from "./interfaces";
import fetch from "../fetchCompat";
import { apiGoogleLangdetect } from "../../apis";
import queryString from "query-string";

type Google1Props = BaseProviderProps & {
  key: string | null;
};

const DEFAULT_PROPS: Google1Props = {
  ...BASE_DEFAULT_PROPS,
  key: null,
};

const GOOGLE1_URL = "https://translate.googleapis.com/translate_a/single";

type Google1Response = {
  sentences: [
    {
      trans: string;
      orig: string;
      backend: number;
    },
  ];
  src: string;
  spell: any;
};

class Google1
  extends BaseProvider<Google1Props>
  implements SingleStingsTranslate, LanguageDetection
{
  type = ProviderType.google1;

  async singleStringTranslate(
    text: string,
    src: LanguageCode,
    dst: LanguageCode
  ): Promise<TranslateResult> {
    // FIXME 语言代码映射
    const url = queryString.stringifyUrl({
      url: GOOGLE1_URL,
      query: {
        client: "gtx",
        dt: "t",
        dj: 1,
        ie: "UTF-8",
        sl: src,
        tl: dst,
        q: text,
      },
    });
    const headers = {
      "Content-type": "application/json",
    };
    if (this.props.key) {
      headers["Authorization"] = `Bearer ${this.props.key}`;
    }
    const resp = await this.queue.add(async () =>
      fetch(url, {
        headers: headers,
        method: "GET",
      })
    );
    if (!resp.ok) {
      throw new Error(`http error ${resp.status} ${resp.statusText}`);
    }
    const json: Google1Response = await resp.json();
    return {
      translate: json.sentences.map((item) => item.trans).join(" "),
      src: json.src,
    };
  }

  languageDetection(text: string): Promise<LanguageCode> {
    return apiGoogleLangdetect(text);
  }
}

export default Google1;
export { DEFAULT_PROPS };
