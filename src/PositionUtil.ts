import { Vector3 } from "three";
import type { LatitudeLongitude } from "./LatitudeLongitude.js";
import { latlon2xy, xyzone } from "./latlonxy.js";

/**
 * 各種座標とXYZ座標を変換するユーティリティ関数
 */

/**
 * 緯度経度座標を直交座標系（平面直角座標系）のXZ平面上の座標に変換します。
 * この関数は、Three.jsのVector3形式で結果を返します。
 *
 * @param latLng 変換する緯度経度座標。`LatitudeLongitude` 型のオブジェクトで、`lat` (緯度) と `lng` (経度) を含みます。
 * @param origin 座標系の原点となる緯度経度座標。シーンの原点がこの緯度経度として扱われます。
 * @returns 変換されたThree.jsのVector3オブジェクト。X軸は東方向、Z軸は北方向に対応し、Y軸は常に0です。
 */
export function toTransverseMercatorXZ(
  latLng: LatitudeLongitude,
  origin: LatitudeLongitude,
): Vector3 {
  const zone = xyzone(origin.lat, origin.lng);
  const xy = latlon2xy(latLng.lat, latLng.lng, zone);
  return new Vector3(xy[1], 0, -xy[0]);
}
