import { defineConfig } from "jest";

export default defineConfig({
  setupFiles: ["./jest.setup.js"],
  testEnvironment: "jsdom",
  transformIgnorePatterns: ["/node_modules/(?!.*)"],
  transform: {
    "\\.[jt]sx?$": ["babel-jest", { configFile: "./.babelrc" }],
  },
  moduleNameMapper: {
    "^webextension-polyfill$":
      "<rootDir>/src/__mocks__/webextension-polyfill.js",
  },
});
