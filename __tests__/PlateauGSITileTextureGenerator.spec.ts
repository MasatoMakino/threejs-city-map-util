import { describe, test, expect, beforeEach, vi } from "vitest";
import { PlateauGSITileTextureGenerator } from "../src/PlateauGSITileTextureGenerator.js";
import { fetchImageMock } from "./FetchImageMock.js";

describe("PlateauGSITileTextureGenerator", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation(fetchImageMock);
  });

  test("generate", async () => {
    const result = await PlateauGSITileTextureGenerator.generate("53393599");
    expect(result).toMatchObject({ format: "jpeg", height: 478, width: 582 });
  });

  test("incorrect mesh code", async () => {
    const result = await PlateauGSITileTextureGenerator.generate(
      "incorrect mesh code",
    );
    expect(result).toBeUndefined();
  });

  test("incorrect zoom scale", async () => {
    const result = await PlateauGSITileTextureGenerator.generate("53393599", {
      zoomLevel: 10,
    });
    expect(result).toBeUndefined();
  });
});
