import { LatitudeLongitude, JapanStandardRegionalMeshUtil } from "../src";

describe("JapanStandardRegionalMeshUtil", () => {
  const testLatLng = new LatitudeLongitude(
    35.65864183184921,
    139.74544075634395
  ); //東京タワー
  const testMeshCode = "53393599"; //東京タワーを含むメッシュコード

  test("Primary mesh code to lat-lng", () => {
    const latLng = JapanStandardRegionalMeshUtil.toLatitudeLongitude(
      testMeshCode.slice(0, 4)
    );
    expect(latLng).toEqual(new LatitudeLongitude(35.33333333333333, 139));
  });

  test("Secondary mesh code to lat-lng", () => {
    const latLng = JapanStandardRegionalMeshUtil.toLatitudeLongitude(
      testMeshCode.slice(0, 6)
    );
    expect(latLng).toEqual(new LatitudeLongitude(35.58333333333333, 139.625));
  });

  test("Standard mesh code to lat-lng", () => {
    const latLng = JapanStandardRegionalMeshUtil.toLatitudeLongitude(
      testMeshCode.slice(0, 8)
    );
    expect(latLng).toEqual(new LatitudeLongitude(35.65833333333333, 139.7375));
  });

  test("Half mesh 1 === Standard mesh", () => {
    expect(
      JapanStandardRegionalMeshUtil.toLatitudeLongitude(testMeshCode)
    ).toEqual(
      JapanStandardRegionalMeshUtil.toLatitudeLongitude(testMeshCode + "1")
    );
  });

  test("Quad mesh 11 === Standard mesh", () => {
    expect(
      JapanStandardRegionalMeshUtil.toLatitudeLongitude(testMeshCode)
    ).toEqual(
      JapanStandardRegionalMeshUtil.toLatitudeLongitude(testMeshCode + "11")
    );
  });

  test("Quad mesh 44", () => {
    expect(
      JapanStandardRegionalMeshUtil.toLatitudeLongitude(testMeshCode + "44")
    ).toEqual(new LatitudeLongitude(35.66458333333333, 139.74687500000002));
  });

  test("NaN to lat-lng", () => {
    const latLng = JapanStandardRegionalMeshUtil.toLatitudeLongitude("NaN");
    expect(latLng).toEqual(undefined);
  });

  test("Non-standard digits are undefined", () => {
    expect(JapanStandardRegionalMeshUtil.toLatitudeLongitude("2")).toEqual(
      undefined
    );
    expect(JapanStandardRegionalMeshUtil.toLatitudeLongitude("22222")).toEqual(
      undefined
    );
    expect(
      JapanStandardRegionalMeshUtil.toLatitudeLongitude("22222222222222")
    ).toEqual(undefined);
  });

  test("toLatLng", () => {
    expect(
      JapanStandardRegionalMeshUtil.fromLongitudeLatitude(testLatLng).slice(
        0,
        8
      )
    ).toBe(testMeshCode);
  });
});
