import {
  PlaceholderTagFormatType,
  PlaceholderTagFormatTypeValue,
  ToggleTypeValue,
} from "./constants";
import type {
  PlaceholderSting,
  PlaceholderTag,
  ProviderType,
  ToggleType,
} from "./constants";
import PQueue from "p-queue";

type BaseProviderProps = {
  type: ProviderType;
  name: string;
  label: string;
  id: string;
  enable: boolean;
  icon: string | null;
  sortOrder: number;
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
  type: undefined,
  name: undefined,
  label: undefined,
  id: undefined,
  icon: null,
  sortOrder: 0,
  enable: true,
  toggleType: ToggleTypeValue.scroll,
  toggleDelay: 200,
  concurrencyCount: 10,
  concurrencyInterval: 100,
  timeout: 30,
  placeholderSting: "{ }",
  placeholderTag: "<a>",
  placeholderTagFormatType: PlaceholderTagFormatTypeValue.compact,
};

abstract class BaseProvider<Props extends BaseProviderProps> {
  abstract type: ProviderType;
  protected props: Props;
  queue: PQueue;

  constructor(props: Props) {
    this.props = props;
    this.queue = new PQueue({
      concurrency: props.concurrencyCount,
      intervalCap: props.concurrencyCount,
      interval: props.concurrencyInterval,
      timeout: props.timeout * 1000,
    });
  }
}

export default BaseProvider;
export type { BaseProviderProps };
export { DEFAULT_PROPS };
