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
   * 触发延迟毫秒
   */
  toggleDelayMs: number;
  concurrencyCount: number;
  concurrencyInterval: number;
  /**
   * 请求超时秒
   */
  timeoutS: number;
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
  toggleDelayMs: 200,
  concurrencyCount: 10,
  concurrencyInterval: 100,
  timeoutS: 30,
  placeholderSting: "{ }",
  placeholderTag: "a",
  placeholderTagFormatType: PlaceholderTagFormatTypeValue.compact,
};

type BatchTranslateProps = {
  batchIntervalMs: number;
  batchSize: number;
  batchLength: number;
};

const BATCH_TRANSLATE_PROPS: BatchTranslateProps = {
  batchIntervalMs: 400,
  batchSize: 20,
  batchLength: 10_000,
};

abstract class BaseProvider<Props extends BaseProviderProps> {
  protected props: Props;
  protected queue: PQueue;

  abstract type: ProviderType;

  constructor(props: Props) {
    this.props = props;
    this.queue = new PQueue({
      concurrency: props.concurrencyCount,
      intervalCap: props.concurrencyCount,
      interval: props.concurrencyInterval,
      timeout: props.timeoutS * 1000,
    });
  }
}

export default BaseProvider;
export type { BaseProviderProps, BatchTranslateProps };
export { DEFAULT_PROPS, BATCH_TRANSLATE_PROPS };
