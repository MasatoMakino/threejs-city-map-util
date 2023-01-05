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
 *
 * TODO : プラトーモデルの設置テスト
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
  static toLatitudeLongitude(mesh: string): LatitudeLongitude | undefined {
    if (Number.isNaN(Number(mesh))) {
      console.warn(
        "メッシュコードが10進数以外で指定されています。変換ができないため、undefinedを返します。"
      );
      return undefined;
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
        return undefined;
    }

    const toPrimaryLatLng = (mesh: string): LatitudeLongitude => {
      const latLng = new LatitudeLongitude();
      const primaryMeshCode = mesh.slice(0, 4);
      latLng.lat = Number(primaryMeshCode.slice(0, 2)) * this.primaryLatUnit;
      latLng.lng = Number(primaryMeshCode.slice(2, 4)) + 100;
      return latLng;
    };
    const latLng = toPrimaryLatLng(mesh);

    if (mesh.length === 4) {
      return latLng;
    }

    const addSecondaryLatLng = (
      primaryLatLng: LatitudeLongitude,
      mesh: string
    ): void => {
      const secondaryMeshCode = mesh.slice(4, 6);
      latLng.lat +=
        (Number(secondaryMeshCode.slice(0, 1)) * this.primaryLatUnit) / 8;
      latLng.lng += Number(secondaryMeshCode.slice(1, 2)) / 8;
    };
    addSecondaryLatLng(latLng, mesh);

    if (mesh.length === 6) {
      return latLng;
    }

    const addTertiaryLatLng = (
      latLng: LatitudeLongitude,
      mesh: string
    ): void => {
      const tertiaryMeshCode = mesh.slice(6, 8);
      if (tertiaryMeshCode === "") return;
      latLng.lat +=
        (Number(tertiaryMeshCode.slice(0, 1)) * this.primaryLatUnit) / 8 / 10;
      latLng.lng += Number(tertiaryMeshCode.slice(1, 2)) / 8 / 10;
    };
    addTertiaryLatLng(latLng, mesh);

    const addQuadrantMeshLatLng = (
      latLng: LatitudeLongitude,
      unitLat: number,
      unitLng: number,
      code: string
    ) => {
      if (code === "") return;
      const meshNumber = Number(code);
      if (meshNumber > 4) return;

      latLng.lat += meshNumber > 2 ? unitLat : 0;
      latLng.lng += meshNumber % 2 === 0 ? unitLng : 0;
    };
    const addHalfKmMeshLatLng = (
      latLng: LatitudeLongitude,
      mesh: string
    ): void => {
      addQuadrantMeshLatLng(
        latLng,
        this.primaryLatUnit / 8 / 10 / 2,
        1 / 8 / 10 / 2,
        mesh.slice(8, 9)
      );
    };
    addHalfKmMeshLatLng(latLng, mesh);

    const addQuadKmMeshLatLng = (
      latLng: LatitudeLongitude,
      mesh: string
    ): void => {
      addQuadrantMeshLatLng(
        latLng,
        this.primaryLatUnit / 8 / 10 / 2 / 2,
        1 / 8 / 10 / 2 / 2,
        mesh.slice(9, 10)
      );
    };
    addQuadKmMeshLatLng(latLng, mesh);

    return latLng;
  }

  public static fromLongitudeLatitude(
    latitudeLongitude: LatitudeLongitude
  ): string {
    const latLng = latitudeLongitude.clone();

    const subLatLng = (
      latLng: LatitudeLongitude,
      unitLat: number,
      unitLng: number,
      shiftLng: number = 0
    ): string => {
      const latCode = Math.floor(latLng.lat / unitLat);
      const lngCode = Math.floor(latLng.lng / unitLng - shiftLng);
      latLng.lat -= latCode * unitLat;
      latLng.lng -= lngCode * unitLng + shiftLng;
      return `${latCode}${lngCode}`;
    };

    let code = subLatLng(latLng, this.primaryLatUnit, 1, 100);
    code += subLatLng(latLng, this.primaryLatUnit / 8, 1 / 8);
    code += subLatLng(latLng, this.primaryLatUnit / 8 / 10, 1 / 8 / 10);

    const subQuadKmMeshLatLng = (
      latLng: LatitudeLongitude,
      unitLat: number,
      unitLng: number
    ): string => {
      const flagLat = latLng.lat > unitLat;
      const flagLng = latLng.lng > unitLng;
      latLng.lat -= flagLat ? unitLat : 0;
      latLng.lng -= flagLng ? unitLng : 0;
      return `${Number(flagLat) * 2 + Number(flagLng) + 1}`;
    };

    code += subQuadKmMeshLatLng(
      latLng,
      this.primaryLatUnit / 8 / 10 / 2,
      1 / 8 / 10 / 2
    );

    code += subQuadKmMeshLatLng(
      latLng,
      this.primaryLatUnit / 8 / 10 / 2 / 2,
      1 / 8 / 10 / 2 / 2
    );

    return code;
  }
}
