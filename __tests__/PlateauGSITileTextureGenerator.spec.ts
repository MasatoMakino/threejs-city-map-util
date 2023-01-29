import { PlateauGSITileTextureGenerator } from "../src/PlateauGSITileTextureGenerator";
import { fetchImageMock } from "./FetchImageMock";

describe("PlateauGSITileTextureGenerator", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(fetchImageMock);
  });

  test("generate", () => {
    const result = PlateauGSITileTextureGenerator.generate("53393599");
  });
});
