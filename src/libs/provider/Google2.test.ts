/**
 * @jest-environment node
 */

import Google2, { GOOGLE2_DEFAULT_PROPS } from "./Google2";

describe("Google2", () => {
  const google2 = new Google2(GOOGLE2_DEFAULT_PROPS);

  test("simple single translate", async () => {
    const result = await google2.translate("你好", "zh-CN", "en");
    expect(result).toEqual({ src: null, translate: "Hello" });
  });
});
