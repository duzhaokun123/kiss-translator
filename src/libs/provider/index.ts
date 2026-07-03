import BaseProvider, { BaseProviderProps } from "./BaseProvider";
import Google1, { Google1Props } from "./Google1";
import Google2, { Google2Props } from "./Google2";
import { ProviderType } from "./constants";
export type {
  PlaceholderSting,
  PlaceholderTag,
  LanguageCode,
} from "./constants";

type ProviderProps = BaseProviderProps | Google1Props | Google2Props;

function providerFactor(
  providerProps: ProviderProps
): BaseProvider<BaseProviderProps> {
  switch (providerProps.type) {
    case ProviderType.google1:
      return new Google1(providerProps as Google1Props);
    case ProviderType.google2:
      return new Google2(providerProps as Google2Props);
  }
  return null;
}

export { providerFactor };
