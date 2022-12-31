/**
 * 緯度経度を表すクラス
 *
 * 特に指定がない限り、世界測地系での緯度経度を表します。
 */
export class LatitudeLongitude {
  constructor(lat: number = 0, lng: number = 0) {
    this.lat = lat;
    this.lng = lng;
  }
  /**
   * latitude 緯度
   * format : ddd.ddd... (十進数)
   */
  public lat: number = 0;
  /**
   * longitude 経度
   * format : ddd.ddd... (十進数)
   */
  public lng: number = 0;

  clone(): LatitudeLongitude {
    return new LatitudeLongitude(this.lat, this.lng);
  }
}
