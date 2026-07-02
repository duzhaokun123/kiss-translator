import BaseProvider, {
  BaseProviderProps,
  DEFAULT_PROPS as BASE_DEFAULT_PROPS,
} from "./BaseProvider";
import { LanguageCode, PlaceholderTagFormatType, ProviderType } from "./index";
import {
  MultiStringTranslate,
  SingleStingsTranslate,
  TranslateResult,
} from "./interfaces";
import fetch from "../fetchCompat";

type Google2Props = BaseProviderProps & {
  key: string;
};

const DEFAULT_PROPS: Google2Props = {
  ...BASE_DEFAULT_PROPS,
  placeholderTag: "<a>",
  placeholderTagFormatType: PlaceholderTagFormatType.attribute,
  key: "AIzaSyATBXajvzQLTDHEQbcpq0Ihe0vWDHmO520",
};

const GOOGLE2_URL = "https://translate-pa.googleapis.com/v1/translateHtml";

/**
 * FIXME: 使用官方客户端库 这个端口甚至没有文档
 */
class Google2
  extends BaseProvider<Google2Props>
  implements SingleStingsTranslate, MultiStringTranslate
{
  type = ProviderType.google2;

  async singleStringTranslate(
    text: string,
    src: LanguageCode,
    dst: LanguageCode
  ): Promise<TranslateResult> {
    return (await this.multiStringTranslate([text], src, dst))[0];
  }

  async multiStringTranslate(
    text: string[],
    src: LanguageCode,
    dst: LanguageCode
  ): Promise<TranslateResult[]> {
    const url = GOOGLE2_URL
    const body = [[text, src, dst], "wt_lib"]
    const headers = {
      "Content-Type": "application/json+protobuf",
      "X-Goog-API-Key": this.props.key,
    };
    const resp = await this.queue.add(async () =>
      fetch(url, {
        headers: headers,
        method: "POST",
        body: JSON.stringify(body),
      })
    )
    if (!resp.ok) {
      throw new Error(`http error ${resp.status} ${resp.statusText}`);
    }
    const json: [[string]] = await resp.json()
    return json[0].map((item) => {
      return {
        translate: item,
        src: null
      }
    })
  }
}

export default Google2;
export { DEFAULT_PROPS };
