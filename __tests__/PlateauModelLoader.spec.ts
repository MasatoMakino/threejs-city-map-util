import { beforeEach, describe, expect, test, vi } from "vitest";
import { LatitudeLongitude, PlateauModelLoader } from "../src/index.js";
import { fetchMock } from "./FetchMock.js";

describe("PlateauModelLoader", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation(fetchMock);
  });

  test("load obj file", async () => {
    const origin = new LatitudeLongitude(
      35.65833333333333 + 2 / 3 / 8 / 10 / 2,
      139.7375 + 1 / 160,
    );
    const model = await PlateauModelLoader.loadObjModel(
      "./53393599_dummy_6677.obj",
      origin,
    );
    expect(model).toBeTruthy();
  });
});
