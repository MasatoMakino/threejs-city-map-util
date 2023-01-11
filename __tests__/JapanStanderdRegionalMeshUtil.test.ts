import { LatitudeLongitude, JapanStandardRegionalMeshUtil } from "../src";

describe("JapanStandardRegionalMeshUtil", () => {
  const testLatLng = new LatitudeLongitude(
    35.65864183184921,
    139.74544075634395
  ); //東京タワー
  const testMeshCode = "53393599"; //東京タワーを含むメッシュコード

  const testToLatLng = (
    code: string,
    codeLength: number,
    expectLat: number,
    expectLng: number
  ) => {
    const latLng = JapanStandardRegionalMeshUtil.toLatitudeLongitude(
      code.slice(0, codeLength)
    );
    expect(latLng).toEqual(new LatitudeLongitude(expectLat, expectLng));
  };

  test("Primary mesh code to lat-lng", () => {
    testToLatLng(testMeshCode, 4, 35.33333333333333, 139);
  });
  test("Secondary mesh code to lat-lng", () => {
    testToLatLng(testMeshCode, 6, 35.58333333333333, 139.625);
  });
  test("Standard mesh code to lat-lng", () => {
    testToLatLng(testMeshCode, 8, 35.65833333333333, 139.7375);
  });
  test("Quad mesh 44 to lat-lng", () => {
    testToLatLng(
      testMeshCode + "44",
      10,
      35.66458333333333,
      139.74687500000002
    );
  });

  const testSubMesh = (subMeshCode: string) => {
    expect(
      JapanStandardRegionalMeshUtil.toLatitudeLongitude(testMeshCode)
    ).toEqual(
      JapanStandardRegionalMeshUtil.toLatitudeLongitude(
        testMeshCode + subMeshCode
      )
    );
  };
  test("Half mesh 1 === Standard mesh", () => {
    testSubMesh("1");
  });
  test("Quad mesh 11 === Standard mesh", () => {
    testSubMesh("11");
  });

  const toBeUndefined = (code: string) => {
    const latLng = JapanStandardRegionalMeshUtil.toLatitudeLongitude(code);
    expect(latLng).toEqual(undefined);
  };
  test("NaN to lat-lng are undefined", () => {
    toBeUndefined("NaN");
  });
  test("Non-standard digits are undefined", () => {
    toBeUndefined("");
    toBeUndefined("2");
    toBeUndefined("22222");
    toBeUndefined("22222222222222");
  });

  test("fromLongitudeLatitude", () => {
    const code =
      JapanStandardRegionalMeshUtil.fromLongitudeLatitude(testLatLng);
    expect(code).toBe("5339359921");
    expect(code.slice(0, 8)).toBe(testMeshCode);
  });
});
