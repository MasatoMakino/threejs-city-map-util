import { LatitudeLongitude } from "./LatitudeLongitude";
import { Vector3 } from "three";
import { fromLatLon } from "utm";
/**
 * 各種座標とXYZ座標を変換するユーティリティクラス
 */
export class PositionUtil {
  /**
   * 緯度経度をUTM平面座標に変換する
   * unit : meter
   *
   * TODO : zoneを跨いだ場合正常な値が取得できない。
   *
   * @param latLng
   * @param origin
   */
  toUTMPositionXZ(
    latLng: LatitudeLongitude,
    origin?: LatitudeLongitude
  ): Vector3 {
    const pos = fromLatLon(latLng.lat, latLng.lng);
    const vec = new Vector3(pos.easting, 0, -pos.northing);

    if (origin) {
      const originPos = fromLatLon(origin.lat, origin.lng);
      vec.add(new Vector3(-originPos.easting, 0, originPos.northing));
    }

    return vec;
  }
}
