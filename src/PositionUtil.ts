import { LatitudeLongitude } from "./LatitudeLongitude";
import { Vector3 } from "three";
import { xyzone, latlon2xy } from "./latlonxy";
/**
 * 各種座標とXYZ座標を変換するユーティリティクラス
 */
export class PositionUtil {
  static toTransverseMercatorXZ(
    latLng: LatitudeLongitude,
    origin: LatitudeLongitude
  ): Vector3 {
    const zone = xyzone(origin.lat, origin.lng);
    const xy = latlon2xy(latLng.lat, latLng.lng, zone);
    return new Vector3(xy[1], 0, -xy[0]);
  }
}
