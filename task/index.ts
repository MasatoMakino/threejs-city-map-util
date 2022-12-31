import { JapanStandardRegionalMeshUtil, LatitudeLongitude } from "../src";

const testLatLng = new LatitudeLongitude(35.70854904487315, 139.80033445260256);
const lngLat = JapanStandardRegionalMeshUtil.toLongitudeLatitude("5339");
const lngLat2 = JapanStandardRegionalMeshUtil.toLongitudeLatitude("533946");
const lngLat3 = JapanStandardRegionalMeshUtil.toLongitudeLatitude("53394654");
console.log(lngLat3, "35.70832309409071, 139.79999655889745"); //35.70832309409071, 139.79999655889745

const lngLat4 = JapanStandardRegionalMeshUtil.toLongitudeLatitude("5339465411");
console.log(lngLat4);
console.log(lngLat3?.lat === lngLat4?.lat, lngLat3?.lng === lngLat4?.lng);

console.log(JapanStandardRegionalMeshUtil.toLongitudeLatitude("5339465412"));
console.log(JapanStandardRegionalMeshUtil.toLongitudeLatitude("5339465413"));

const error01 = JapanStandardRegionalMeshUtil.toLongitudeLatitude("4N835@@");
const error02 = JapanStandardRegionalMeshUtil.toLongitudeLatitude("2");
const error03 = JapanStandardRegionalMeshUtil.toLongitudeLatitude("22222");
const error04 =
  JapanStandardRegionalMeshUtil.toLongitudeLatitude("2222233333333333");

console.log(JapanStandardRegionalMeshUtil.fromLongitudeLatitude(testLatLng));
console.log(
  JapanStandardRegionalMeshUtil.fromLongitudeLatitude(
    new LatitudeLongitude(35.71291798459156, 139.80679339105728)
  )
);
