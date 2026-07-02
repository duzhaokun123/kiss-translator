const ProviderType = {
  google1: "google1",
  google2: "google2",
} as const;
type ProviderType = (typeof ProviderType)[keyof typeof ProviderType];

const ToggleType = {
  scroll: "scroll",
  all: "all",
} as const;
type ToggleType = (typeof ToggleType)[keyof typeof ToggleType];

type PlaceholderSting = "{ }" | "{{ }}" | "[ ]" | "[[ ]]";

type PlaceholderTag = "<i>" | "<a>" | "<b>" | "<x>" | "<span>";

const PlaceholderTagFormatType = {
  compact: "compact",
  attribute: "attribute",
} as const;
type PlaceholderTagFormatType = (typeof PlaceholderTagFormatType)[keyof typeof PlaceholderTagFormatType];

type LanguageCode = string;

function providerFactor(type: ProviderType) {}

export { ProviderType, ToggleType, PlaceholderTagFormatType, providerFactor };

export type { PlaceholderSting, PlaceholderTag, LanguageCode };
