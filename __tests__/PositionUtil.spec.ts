import { Vector3 } from "three";
import { TestLatLng, TestMeshCode } from "./Positions.js";
import {
  JapanStandardRegionalMeshUtil,
  PositionUtil,
  LatitudeLongitude,
} from "../src/index.js";

describe("PositionUtil", () => {
  test("XZ location of Tokyo Tower on the Plateau model", () => {
    const centerPos = JapanStandardRegionalMeshUtil.toLatitudeLongitude(
      TestMeshCode,
    ) as LatitudeLongitude;
    const pos = PositionUtil.toTransverseMercatorXZ(TestLatLng, centerPos);
    expect(pos).toEqual(new Vector3(718.968753072712, 0, -34.254358880687505));
  });
});
