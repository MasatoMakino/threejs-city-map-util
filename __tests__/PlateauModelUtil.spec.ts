import "cross-fetch/polyfill";
import {
  PlateauModelUtil,
  JapanStandardRegionalMeshUtil,
  LatitudeLongitude,
} from "../src";

describe("PlateauModelUtil", () => {
  test("file name to mesh code", () => {
    const code = PlateauModelUtil.getMeshCode(
      "13100_tokyo23-ku_2020_obj_3_op/bldg/lod1/53393599_bldg_6677.obj"
    );
    expect(code).toBe("53393599");
  });

  test("get origin from file name", async () => {
    const filePath = "../demoSrc/53393599_bldg_6677.obj";
    const meshCode = PlateauModelUtil.getMeshCode(filePath);
    const origin = JapanStandardRegionalMeshUtil.toLatitudeLongitude(
      meshCode
    ) as LatitudeLongitude;
    expect(origin).toStrictEqual(
      new LatitudeLongitude(35.65833333333333, 139.7375)
    );
  });
});
