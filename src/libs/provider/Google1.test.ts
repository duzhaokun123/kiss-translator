/**
 * @jest-environment node
 */
import Google1, { GOOGLE1_DEFAULT_PROPS } from "./Google1";

describe("Google1", () => {
  const google1 = new Google1(GOOGLE1_DEFAULT_PROPS);

  console.log(JSON.stringify(GOOGLE1_DEFAULT_PROPS));

  test("simple single translate", async () => {
    const result = await google1.singleStringTranslate("你好", "auto", "en");
    expect(result).toEqual({src: "zh-CN", translate: "Hello"})
  });

  test("language detection", async () => {
    const result = await google1.languageDetection("English")
    expect(result).toEqual("en")
  })
});
