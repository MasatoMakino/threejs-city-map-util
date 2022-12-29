import { LatitudeLongitude } from "./LatitudeLongitude";

/**
 * 総務省統計局制定の基準地域メッシュコードを、緯度経度と相互変換するためのクラスです。
 * @see https://www.stat.go.jp/data/mesh/m_tuite.html
 *
 * PLATEAUプラットフォームはファイル命名形式に基準地域メッシュコードを利用しています。
 * @see https://www.mlit.go.jp/plateau/learning/tpc03-1/#p3_1
 */
export class JapanStandardRegionalMeshUtil {
  private static readonly primaryLatUnit: number = (1 / 60) * 40;


  /**
   * 指定されたメッシュコードの、南西端（平面状では左下端）の緯度経度を返します。
   * @param mesh
   */
  static toLongitudeLatitude(mesh: string): LatitudeLongitude {
    const toPrimaryLatLng = (mesh: string):LatitudeLongitude =>{
      const latLng = new LatitudeLongitude();
      const primaryMeshCode = mesh.slice(0, 4);
      latLng.lat = Number(primaryMeshCode.slice(0, 2)) * this.primaryLatUnit;
      latLng.lng = Number(primaryMeshCode.slice(2, 4)) + 100;
      return latLng;
    }

    const latLng = toPrimaryLatLng(mesh);
    if (mesh.length === 4) {
      return latLng;
    }

    const toSecondaryLatLng = (primaryLatLng:LatitudeLongitude, mesh: string):void =>{
      const secondaryMeshCode = mesh.slice(4, 6);
      latLng.lat +=
          (Number(secondaryMeshCode.slice(0, 1)) * this.primaryLatUnit) / 8;
      latLng.lng += Number(secondaryMeshCode.slice(1, 2)) / 8;
    }
    toSecondaryLatLng( latLng, mesh );
    if (mesh.length === 6) {
      return latLng;
    }

    const toTertiaryLatLng = (latLng:LatitudeLongitude, mesh: string):void =>{
      const tertiaryMeshCode = mesh.slice(6, 8);
      latLng.lat +=
          (Number(tertiaryMeshCode.slice(0, 1)) * this.primaryLatUnit) / 8 / 10;
      latLng.lng += Number(tertiaryMeshCode.slice(1, 2)) / 8 / 10;
    }
    toTertiaryLatLng(latLng, mesh)
    console.log( latLng, mesh );

    return latLng;
  }
}
