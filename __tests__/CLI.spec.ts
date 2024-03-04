import fs from "fs";
import util from "util";
import child_process from "child_process";
const exec = util.promisify(child_process.exec);

describe("CLI", () => {
  it("should call CLI", async () => {
    const meshCode = "53393599";
    const { stdout, stderr } = await exec(
      `node ./esm/CLI.js generateTexture ${meshCode}`,
    );
    expect(stderr).toBe("");

    // Check if the generated file exists
    const filePath = `./gsiTexture/${meshCode}_16.jpg`;
    expect(fs.existsSync(filePath)).toBe(true);
  });
});
