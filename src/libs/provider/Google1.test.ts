jest.mock("query-string", () => ({
  stringify: (obj) => new URLSearchParams(obj).toString(),
}));

jest.mock("@streamparser/json", () => ({
  JSONParser: jest.fn(),
}));

jest.mock("webextension-polyfill", () => ({}));

import Google1, { DEFAULT_PROPS } from "./Google1";

describe("Google1", () => {
  const google1 = new Google1(DEFAULT_PROPS);

  test("simple single translate", async () => {
    const result = await google1.singleStringTranslate("你好", "zh", "en");
    expect(result).toEqual({src: "zh-CN", translate: "Hello"})
  });

  test("language detection", async () => {
    const result = await google1.languageDetection("English")
    expect(result).toEqual("en")
  })
});
