import { describe, it, expect } from "vitest";
import fs from "fs";
import util from "util";
import child_process from "child_process";
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
    const { stdout, stderr } = await exec(
      `node ./esm/CLI.js generateTexture ${meshCode}`,
    );
    expect(stderr).toBe("");

    // Check if the generated file exists
    const filePath = `./gsiTexture/${meshCode}_16.jpg`;
    expect(fs.existsSync(filePath)).toBe(true);
  }, 30_000);
});
