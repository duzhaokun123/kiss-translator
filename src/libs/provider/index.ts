enum ProviderType {
  google1 = "google1",
}

enum ToggleType {
  scroll = "scroll",
  all = "all",
}

type PlaceholderSting = "{ }" | "{{ }}" | "[ ]" | "[[ ]]";

type PlaceholderTag = "<i>" | "<a>" | "<b>" | "<x>" | "<span>";

enum PlaceholderTagFormatType {
  compact = "compact",
  attribute = "attribute",
}

type LanguageCode = string;

function providerFactor(type: ProviderType) {}

export { ProviderType, ToggleType, PlaceholderTagFormatType, providerFactor };

export type { PlaceholderSting, PlaceholderTag, LanguageCode };
