import {
  PlaceholderSting,
  PlaceholderTag,
  PlaceholderTagFormatType,
  ProviderType,
  ToggleType,
} from "./index";
import PQueue from "p-queue";

type BaseProviderProps = {
  name: string;
  id: string;
  enable: boolean;
  toggleType: ToggleType;
  /**
   * 毫秒
   */
  toggleDelay: number;
  concurrencyCount: number;
  concurrencyInterval: number;
  /**
   * 秒
   */
  timeout: number;
  placeholderSting: PlaceholderSting;
  placeholderTag: PlaceholderTag;
  placeholderTagFormatType: PlaceholderTagFormatType;
};

const DEFAULT_PROPS: BaseProviderProps = {
  name: undefined,
  id: undefined,
  enable: true,
  toggleType: ToggleType.scroll,
  toggleDelay: 200,
  concurrencyCount: 10,
  concurrencyInterval: 100,
  timeout: 30,
  placeholderSting: "{ }",
  placeholderTag: "<a>",
  placeholderTagFormatType: PlaceholderTagFormatType.compact,
};

abstract class BaseProvider<Props extends BaseProviderProps> {
  abstract type: ProviderType;
  protected props: Props;
  queue: PQueue

  constructor(props: Props) {
    this.props = props;
    this.queue = new PQueue({
      concurrency: props.concurrencyCount,
      intervalCap: props.concurrencyCount,
      interval: props.concurrencyInterval,
      timeout: props.timeout * 1000,
    })
  }
}

export default BaseProvider;
export type { BaseProviderProps };
export { DEFAULT_PROPS };
