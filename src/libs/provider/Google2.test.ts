/**
 * @jest-environment node
 */

import Google2, { GOOGLE2_DEFAULT_PROPS } from "./Google2";

describe("Google2", () => {
  const google2 = new Google2(GOOGLE2_DEFAULT_PROPS);

  test("simple single translate", async () => {
    const result = await google2.singleStringTranslate("你好", "zh-CN", "en");
    expect(result).toEqual({src: null, translate: "Hello"})
  });

  test("simple multi translate", async () => {
    const result = await google2.multiStringTranslate(["你好", "世界"], "zh-CN", "en")
    expect(result).toEqual([
      { src: null, translate: "Hello" },
      { src: null, translate: "world" },
    ]);
  })
});
