/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  transformIgnorePatterns: ["/node_modules/(?!three/)"],
  transform: {
    "node_modules/three/examples/.+\.(j|t)sx?$": "ts-jest"
  },
  testEnvironment: "jest-environment-jsdom",
};
