import { PlateauModelUtil } from "../src";

describe("PlateauModelUtil", () => {
  test("file name to mesh code", () => {
    const code = PlateauModelUtil.getMeshCode(
      "13100_tokyo23-ku_2020_obj_3_op/bldg/lod1/53393599_bldg_6677.obj"
    );
    expect(code).toBe("53393599");
  });
});
