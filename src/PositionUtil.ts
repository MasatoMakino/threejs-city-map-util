import { Vector3 } from "three";
import type { LatitudeLongitude } from "./LatitudeLongitude.js";
import { latlon2xy, xyzone } from "./latlonxy.js";
/**
 * 各種座標とXYZ座標を変換するユーティリティクラス
 */
export class PositionUtil {
  static toTransverseMercatorXZ(
    latLng: LatitudeLongitude,
    origin: LatitudeLongitude,
  ): Vector3 {
    const zone = xyzone(origin.lat, origin.lng);
    const xy = latlon2xy(latLng.lat, latLng.lng, zone);
    return new Vector3(xy[1], 0, -xy[0]);
  }
}
