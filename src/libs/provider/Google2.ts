import BaseProvider, {
  BATCH_TRANSLATE_PROPS,
  BatchTranslateProps,
  DEFAULT_PROPS,
} from "./BaseProvider";
import type { BaseProviderProps } from "./BaseProvider";
import {
  LanguageCode,
  PlaceholderTagFormatTypeValue,
  ProviderTypeValue,
} from "./constants";
import type { Translate, TranslateResult } from "./interfaces";
import fetch from "../fetchCompat";
import { BatchQueue } from "../batchQueue";

type Google2Props = BaseProviderProps &
  BatchTranslateProps & {
    key: string;
  };

const GOOGLE2_DEFAULT_PROPS: Google2Props = {
  ...DEFAULT_PROPS,
  ...BATCH_TRANSLATE_PROPS,
  type: ProviderTypeValue.google2,
  label: "Google2",
  icon: "Google2",
  placeholderTag: "a",
  placeholderTagFormatType: PlaceholderTagFormatTypeValue.attribute,
  key: "AIzaSyATBXajvzQLTDHEQbcpq0Ihe0vWDHmO520",
};

const GOOGLE2_URL = "https://translate-pa.googleapis.com/v1/translateHtml";

/**
 * FIXME: 使用官方客户端库 这个端点甚至没有文档
 */
class Google2 extends BaseProvider<Google2Props> implements Translate {
  type = ProviderTypeValue.google2;
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
    const url = GOOGLE2_URL;
    const body = [[text, src, dst], "wt_lib"];
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
    );
    if (!resp.ok) {
      throw new Error(`http error ${resp.status} ${resp.statusText}`);
    }
    const json: string[][] = await resp.json();
    return json[0].map((item) => {
      return {
        translate: item,
        src: null,
      };
    });
  }
}

export default Google2;
export type { Google2Props };
export { GOOGLE2_DEFAULT_PROPS };
