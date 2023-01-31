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
});
