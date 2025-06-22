import child_process from "node:child_process";
import fs from "node:fs";
import util from "node:util";
import { describe, expect, it } from "vitest";

const exec = util.promisify(child_process.exec);

describe("CLI", () => {
  it("should correctly parse CLI arguments", async () => {
    const meshCode = "53393599";
    process.argv = [
      "/usr/local/bin/node",
      "./src/CLI.ts",
      "generateTexture",
      meshCode,
    ];
    const result = await import("../src/CLI.ts");

    expect(result).toBeDefined();
  });

  it("should create a texture for the specified mesh code using CLI", async () => {
    const meshCode = "53393599";
    const { stderr } = await exec(
      `node ./esm/CLI.js generateTexture ${meshCode}`,
    );
    expect(stderr).toBe("");

    // Check if the generated file exists
    const filePath = `./gsiTexture/${meshCode}_16.jpg`;
    expect(fs.existsSync(filePath)).toBe(true);
  }, 30_000);
});
