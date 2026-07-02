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
import { genGoogle } from "../../apis/trans";
import { fetchData } from "../fetch";
import { apiGoogleLangdetect } from "../../apis";

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
    const { url, headers, method } = genGoogle({
      texts: [text],
      from: src,
      to: dst,
      url: GOOGLE1_URL,
      key: this.props.key,
    });
    const resp: Google1Response = await fetchData(url, headers, {
      useCache: false,
      usePool: true,
      fetchInterval: this.props.concurrencyInterval,
      fetchLimit: this.props.concurrencyCount,
      // @ts-ignore
      httpTimeout: this.props.timeout,
    });
    if (!resp) {
      throw new Error("translate got empty response");
    }

    return {
      translate: resp.sentences.map((item) => item.trans).join(" "),
      src: resp.src,
    };
  }

  languageDetection(text: string): Promise<LanguageCode> {
    return apiGoogleLangdetect(text);
  }
}

export default Google1;
export { DEFAULT_PROPS };
