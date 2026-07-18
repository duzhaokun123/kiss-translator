import BaseProvider, { BaseProviderProps } from "./BaseProvider";
import Google1, { Google1Props } from "./Google1";
import Google2, { Google2Props } from "./Google2";
import Microsoft, { MicrosoftProps } from "./Microsoft";
import AzureAI, { AzureAIProps } from "./AzureAI";
import Tencent, { TencentProps } from "./Tencent";
import Volcengine, { VolcengineProps } from "./Volcengine";
import DeepL, { DeepLProps } from "./DeepL";
import CloudflareAI, { CloudflareAIProps } from "./CloudflareAI";
import BuiltinAI, { BuiltinAIProps } from "./BuiltinAI";
import { ProviderTypeValue } from "./constants";

type ProviderProps =
  | BaseProviderProps
  | Google1Props
  | Google2Props
  | MicrosoftProps
  | AzureAIProps
  | TencentProps
  | VolcengineProps
  | DeepLProps
  | CloudflareAIProps
  | BuiltinAIProps;

type Provider =
  | BaseProvider<ProviderProps>
  | Google1
  | Google2
  | Microsoft
  | AzureAI
  | Tencent
  | Volcengine
  | DeepL
  | CloudflareAI
  | BuiltinAI;

const providerCache = new Map<string, BaseProvider<ProviderProps>>();

export default {
  createByProps(
    providerProps: ProviderProps,
    useCache: Boolean = true
  ): Provider {
    let provider: BaseProvider<ProviderProps> | null;
    provider = providerCache[providerProps.id];
    if (provider != null && useCache) {
      return provider;
    }
    switch (providerProps.type) {
      case ProviderTypeValue.google1:
        provider = new Google1(providerProps as Google1Props);
        break;
      case ProviderTypeValue.google2:
        provider = new Google2(providerProps as Google2Props);
        break;
      case ProviderTypeValue.microsoft:
        provider = new Microsoft(providerProps as MicrosoftProps);
        break;
      case ProviderTypeValue.azureai:
        provider = new AzureAI(providerProps as AzureAIProps);
        break;
      case ProviderTypeValue.tencent:
        provider = new Tencent(providerProps as TencentProps);
        break;
      case ProviderTypeValue.volcengine:
        provider = new Volcengine(providerProps as VolcengineProps);
        break;
      case ProviderTypeValue.deepl:
        provider = new DeepL(providerProps as DeepLProps);
        break;
      case ProviderTypeValue.cloudflareai:
        provider = new CloudflareAI(providerProps as CloudflareAIProps);
        break;
      case ProviderTypeValue.builtinai:
        provider = new BuiltinAI(providerProps as BuiltinAIProps);
        break;
    }
    providerCache[providerProps.id] = provider;
    return provider;
  },

  createById(id: string, providerPropsList: ProviderProps[], useCache: Boolean = true): Provider {
    let provider: BaseProvider<ProviderProps> | null;
    provider = providerCache[id];
    if (provider != null && useCache) {
      return provider;
    }
    const providerProps = providerPropsList.find((provider) => provider.id === id);
    if (providerProps == null) {
      throw new Error(`Provider ${id} not found`);
    }
    return this.createByProps(providerProps, useCache);
  }
}
