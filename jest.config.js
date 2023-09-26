/** @type {import('ts-jest').JestConfigWithTsJest} */
const jestConfig = {
  preset: "ts-jest",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transformIgnorePatterns: ["/node_modules/(?!three/examples/)"],
  transform: {
    "^.+\\.(j|t)sx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["**/__tests__/?(*.)+(test|spec).[jt]s?(x)"],
  collectCoverageFrom: ["src/**/*.ts"],
};

export default jestConfig;
