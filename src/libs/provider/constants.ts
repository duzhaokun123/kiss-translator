export const ProviderTypeValue = {
  google1: "google1",
  google2: "google2",
  microsoft: "microsoft",
  azureai: "azureai",
  tencent: "tencent",
  volcengine: "volcengine",
  deepl: "deepl",
  cloudflareai: "cloudflareai",
} as const;
export type ProviderType =
  (typeof ProviderTypeValue)[keyof typeof ProviderTypeValue];

export const ToggleTypeValue = {
  scroll: "scroll",
  all: "all",
} as const;
export type ToggleType = (typeof ToggleTypeValue)[keyof typeof ToggleTypeValue];

export type PlaceholderSting = "{ }" | "{{ }}" | "[ ]" | "[[ ]]";

export type PlaceholderTag = "i" | "a" | "b" | "x" | "span";

export const PlaceholderTagFormatTypeValue = {
  compact: "compact",
  attribute: "attribute",
} as const;
export type PlaceholderTagFormatType =
  (typeof PlaceholderTagFormatTypeValue)[keyof typeof PlaceholderTagFormatTypeValue];

export type LanguageCode =
  | "en"
  | "zh-CN"
  | "zh-TW"
  | "ar"
  | "bg"
  | "ca"
  | "hr"
  | "cs"
  | "da"
  | "nl"
  | "fa"
  | "fi"
  | "fr"
  | "de"
  | "el"
  | "hi"
  | "hu"
  | "id"
  | "it"
  | "ja"
  | "ko"
  | "ms"
  | "mt"
  | "nb"
  | "pl"
  | "pt"
  | "ro"
  | "ru"
  | "sk"
  | "sl"
  | "es"
  | "sv"
  | "ta"
  | "te"
  | "th"
  | "tr"
  | "uk"
  | "vi"
  | "auto";
