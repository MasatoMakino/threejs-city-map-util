import {LatitudeLongitude, JapanStandardRegionalMeshUtil} from "../src";

describe("JapanStandardRegionalMeshUtil", () => {
  const testLatLng = new LatitudeLongitude(35.65864183184921, 139.74544075634395); //東京タワー
  const testMeshCode = "53393599"; //東京タワーを含むメッシュコード

  test("", ()=>{
    const latLng = JapanStandardRegionalMeshUtil.toLatitudeLongitude(testMeshCode.slice(0,4));
    expect(latLng).toEqual(new LatitudeLongitude(35.33333333333333,139));
  })

});
