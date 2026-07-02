import {
  PlaceholderSting,
  PlaceholderTag,
  PlaceholderTagFormatType,
  ProviderType,
  ToggleType,
} from "./index";

type BaseProviderProps = {
  name: string;
  id: string;
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
  toggleType: ToggleType.scroll,
  toggleDelay: 200,
  concurrencyCount: 10,
  concurrencyInterval: 100,
  timeout: 30,
  placeholderSting: "{ }",
  placeholderTag: "<a>",
  placeholderTagFormatType: PlaceholderTagFormatType.compact,
};

abstract class BaseProvider<Props> {
  abstract type: ProviderType;
  protected props: Props;

  constructor(props: Props) {
    this.props = props;
  }
}

export default BaseProvider;
export type { BaseProviderProps };
export { DEFAULT_PROPS };
