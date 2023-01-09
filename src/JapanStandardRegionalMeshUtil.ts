import { LatitudeLongitude } from "./LatitudeLongitude";

/**
 * 総務省統計局制定の基準地域メッシュコードを、緯度経度と相互変換するためのクラスです。
 * @see https://www.stat.go.jp/data/mesh/m_tuite.html
 * 基準地域メッシュコードは、世界測地系での緯度経度を基準に算出されます。
 * @see https://www.stat.go.jp/data/mesh/pdf/gaiyo1.pdf
 * 基準地域メッシュコードの概要図はこちらを参照ください。
 * @see https://www.stat.go.jp/data/mesh/pdf/m-kukaku.pdf
 *
 * PLATEAUプラットフォームはファイル命名形式に基準地域メッシュコードを利用しています。
 * @see https://www.mlit.go.jp/plateau/learning/tpc03-1/#p3_1
 * インタラクティブマップで目的地のメッシュコードが確認できます。
 * @see https://jstatmap.e-stat.go.jp/jstatmap/main/trialstart.html
 */
export class JapanStandardRegionalMeshUtil {
  /**
   * 一次メッシュにおける、緯度の単位。
   * 一次メッシュが1変わると、緯度は2/3度変わる
   * @private
   */
  private static readonly primaryLatUnit: number = (1 / 60) * 40;
  public static readonly MeshCodeLatitudeUnit = this.primaryLatUnit / 8 / 10;
  public static readonly MeshCodeLongitudeUnit = 1 / 8 / 10;

  /**
   * 指定されたメッシュコードの、南西端（平面状では左下端）の緯度経度を返します。
   * @param mesh
   */
  static toLatitudeLongitude(mesh?: string): LatitudeLongitude | undefined {
    if (mesh == null || !this.validateMeshCode(mesh)) {
      return undefined;
    }

    const latLng = new LatitudeLongitude();

    this.addLatLng(latLng, mesh, 0, 4, 1, 100);
    this.addLatLng(latLng, mesh, 4, 6, 1 / 8);
    this.addLatLng(latLng, mesh, 6, 8, 1 / 8 / 10);

    this.addQuadrantMeshLatLng(latLng, 1 / 2, mesh.slice(8, 9));
    this.addQuadrantMeshLatLng(latLng, 1 / 2 / 2, mesh.slice(9, 10));

    return latLng;
  }

  private static validateMeshCode(mesh?: string): boolean {
    if (mesh == null) {
      return false;
    }
    if (Number.isNaN(Number(mesh))) {
      console.warn(
        "メッシュコードが10進数以外で指定されています。変換ができないため、undefinedを返します。"
      );
      return false;
    }

    switch (mesh.length) {
      case 4:
      case 6:
      case 8:
      case 9:
      case 10:
        break;
      default:
        console.warn(
          `メッシュコードの桁数${mesh.length}は不正です。変換ができないため、undefinedを返します。`
        );
        return false;
    }
    return true;
  }

  private static addLatLng(
    latLng: LatitudeLongitude,
    code: string,
    startIndex: number,
    endIndex: number,
    latLngScale: number,
    shiftLng: number = 0
  ): void {
    const centerIndex = startIndex + (endIndex - startIndex) / 2;
    const latCode = code.slice(startIndex, centerIndex);
    const lngCode = code.slice(centerIndex, endIndex);
    if (latCode === "" || lngCode === "") return;
    latLng.lat += Number(latCode) * this.primaryLatUnit * latLngScale;
    latLng.lng += Number(lngCode) * latLngScale + shiftLng;
  }
  private static addQuadrantMeshLatLng(
    latLng: LatitudeLongitude,
    latLngScale: number,
    code: string
  ): void {
    if (code === "") return;
    const meshNumber = Number(code);
    if (meshNumber > 4) return;

    latLng.lat += meshNumber > 2 ? this.MeshCodeLatitudeUnit * latLngScale : 0;
    latLng.lng +=
      meshNumber % 2 === 0 ? this.MeshCodeLongitudeUnit * latLngScale : 0;
  }

  public static fromLongitudeLatitude(
    latitudeLongitude: LatitudeLongitude
  ): string {
    const latLng = latitudeLongitude.clone();

    let code = this.subLatLng(latLng, this.primaryLatUnit, 1, 100);
    code += this.subLatLng(latLng, this.primaryLatUnit / 8, 1 / 8);
    code += this.subLatLng(latLng, this.primaryLatUnit / 8 / 10, 1 / 8 / 10);

    code += this.subQuadKmMeshLatLng(
      latLng,
      this.primaryLatUnit / 8 / 10 / 2,
      1 / 8 / 10 / 2
    );

    code += this.subQuadKmMeshLatLng(
      latLng,
      this.primaryLatUnit / 8 / 10 / 2 / 2,
      1 / 8 / 10 / 2 / 2
    );

    return code;
  }

  private static subLatLng(
    latLng: LatitudeLongitude,
    unitLat: number,
    unitLng: number,
    shiftLng: number = 0
  ): string {
    const latCode = Math.floor(latLng.lat / unitLat);
    const lngCode = Math.floor(latLng.lng / unitLng - shiftLng);
    latLng.lat -= latCode * unitLat;
    latLng.lng -= lngCode * unitLng + shiftLng;
    return `${latCode}${lngCode}`;
  }

  private static subQuadKmMeshLatLng(
    latLng: LatitudeLongitude,
    unitLat: number,
    unitLng: number
  ): string {
    const flagLat = latLng.lat > unitLat;
    const flagLng = latLng.lng > unitLng;
    latLng.lat -= flagLat ? unitLat : 0;
    latLng.lng -= flagLng ? unitLng : 0;
    return `${Number(flagLat) * 2 + Number(flagLng) + 1}`;
  }
}
