/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  transformIgnorePatterns: ["/node_modules/(?!three/examples/)"],
  transform: {
    "node_modules/three/examples/.+.(j|t)sx?$": "ts-jest",
  },
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["**/__tests__/?(*.)+(test|spec).[jt]s?(x)"],
  collectCoverageFrom: ["src/**/*.ts"],
};
