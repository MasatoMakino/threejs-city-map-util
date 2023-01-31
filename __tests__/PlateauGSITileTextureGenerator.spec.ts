import { PlateauGSITileTextureGenerator } from "../src/PlateauGSITileTextureGenerator";
import { fetchImageMock } from "./FetchImageMock";

describe("PlateauGSITileTextureGenerator", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(fetchImageMock);
  });

  test("generate", async () => {
    const result = await PlateauGSITileTextureGenerator.generate("53393599");
    expect(result).toMatchObject({ format: "jpeg", height: 478, width: 582 });
  });

  test("incorrect mesh code", async () => {
    const result = await PlateauGSITileTextureGenerator.generate(
      "incorrect mesh code"
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
