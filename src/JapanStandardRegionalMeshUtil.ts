import { LatitudeLongitude } from "./LatitudeLongitude.js";

/**
 * 総務省統計局制定の基準地域メッシュコードを、緯度経度と相互変換するためのモジュールです。
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

/**
 * 一次メッシュにおける、緯度の単位。
 * 一次メッシュが1変わると、緯度は2/3度変わる
 * @private
 */
const primaryLatUnit: number = (1 / 60) * 40;
export const MeshCodeLatitudeUnit = primaryLatUnit / 8 / 10;
export const MeshCodeLongitudeUnit = 1 / 8 / 10;

/**
 * 指定されたメッシュコードの、南西端（平面状では左下端）の緯度経度を返します。
 * @param mesh
 */
export function toLatitudeLongitude(
  mesh?: string,
): LatitudeLongitude | undefined {
  if (mesh == null || !validateMeshCode(mesh)) {
    return undefined;
  }

  const latLng = new LatitudeLongitude();

  applyMeshCodeSegmentToLatLng(latLng, mesh, 0, 4, 1, 100);
  applyMeshCodeSegmentToLatLng(latLng, mesh, 4, 6, 1 / 8);
  applyMeshCodeSegmentToLatLng(latLng, mesh, 6, 8, 1 / 8 / 10);

  applyQuadrantMeshCodeToLatLng(latLng, 1 / 2, mesh.slice(8, 9));
  applyQuadrantMeshCodeToLatLng(latLng, 1 / 2 / 2, mesh.slice(9, 10));

  return latLng;
}

function validateMeshCode(mesh?: string): boolean {
  if (mesh == null) {
    return false;
  }
  if (Number.isNaN(Number(mesh))) {
    console.warn(
      "メッシュコードが10進数以外で指定されています。変換ができないため、undefinedを返します。",
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
        `メッシュコードの桁数${mesh.length}は不正です。変換ができないため、undefinedを返します。`,
      );
      return false;
  }
  return true;
}

/**
 * メッシュコードの指定された部分から緯度経度を計算し、既存の緯度経度オブジェクトに加算します。
 * @param latLng - 更新する緯度経度オブジェクト。
 * @param code - メッシュコード文字列。
 * @param startIndex - メッシュコードの開始インデックス。
 * @param endIndex - メッシュコードの終了インデックス。
 * @param latLngScale - 緯度経度のスケールファクター。
 * @param shiftLng - 経度のシフト値。
 */
function applyMeshCodeSegmentToLatLng(
  latLng: LatitudeLongitude,
  code: string,
  startIndex: number,
  endIndex: number,
  latLngScale: number,
  shiftLng: number = 0,
): void {
  const centerIndex = startIndex + (endIndex - startIndex) / 2;
  const latCode = code.slice(startIndex, centerIndex);
  const lngCode = code.slice(centerIndex, endIndex);
  if (latCode === "" || lngCode === "") return;
  latLng.lat += Number(latCode) * primaryLatUnit * latLngScale;
  latLng.lng += Number(lngCode) * latLngScale + shiftLng;
}

/**
 * 四次メッシュコード（象限メッシュ）から緯度経度を計算し、既存の緯度経度オブジェクトに加算します。
 * @param latLng - 更新する緯度経度オブジェクト。
 * @param latLngScale - 緯度経度のスケールファクター。
 * @param code - 四次メッシュコード文字列。
 */
function applyQuadrantMeshCodeToLatLng(
  latLng: LatitudeLongitude,
  latLngScale: number,
  code: string,
): void {
  if (code === "") return;
  const meshNumber = Number(code);
  if (meshNumber < 1 || meshNumber > 4) return;

  latLng.lat += meshNumber > 2 ? MeshCodeLatitudeUnit * latLngScale : 0;
  latLng.lng += meshNumber % 2 === 0 ? MeshCodeLongitudeUnit * latLngScale : 0;
}

export function fromLongitudeLatitude(
  latitudeLongitude: LatitudeLongitude,
): string {
  const latLng = latitudeLongitude.clone();

  let code = extractLatLngToMeshCodeSegment(latLng, primaryLatUnit, 1, 100);
  code += extractLatLngToMeshCodeSegment(latLng, primaryLatUnit / 8, 1 / 8);
  code += extractLatLngToMeshCodeSegment(
    latLng,
    primaryLatUnit / 8 / 10,
    1 / 8 / 10,
  );

  code += extractQuadrantMeshCodeFromLatLng(
    latLng,
    primaryLatUnit / 8 / 10 / 2,
    1 / 8 / 10 / 2,
  );

  code += extractQuadrantMeshCodeFromLatLng(
    latLng,
    primaryLatUnit / 8 / 10 / 2 / 2,
    1 / 8 / 10 / 2 / 2,
  );

  return code;
}

/**
 * 緯度経度からメッシュコードの指定された部分を抽出し、対応する緯度経度を減算します。
 * @param latLng - 更新する緯度経度オブジェクト。
 * @param unitLat - 緯度の単位。
 * @param unitLng - 経度の単位。
 * @param shiftLng - 経度のシフト値。
 * @returns 抽出されたメッシュコードの文字列。
 */
function extractLatLngToMeshCodeSegment(
  latLng: LatitudeLongitude,
  unitLat: number,
  unitLng: number,
  shiftLng: number = 0,
): string {
  const latCode = Math.floor(latLng.lat / unitLat);
  const lngCode = Math.floor(latLng.lng / unitLng - shiftLng);
  latLng.lat -= latCode * unitLat;
  latLng.lng -= lngCode * unitLng + shiftLng;
  return `${latCode}${lngCode}`;
}

/**
 * 緯度経度から四次メッシュコード（象限メッシュ）を抽出し、対応する緯度経度を減算します。
 * @param latLng - 更新する緯度経度オブジェクト。
 * @param unitLat - 緯度の単位。
 * @param unitLng - 経度の単位。
 * @returns 抽出された四次メッシュコードの文字列。
 */
function extractQuadrantMeshCodeFromLatLng(
  latLng: LatitudeLongitude,
  unitLat: number,
  unitLng: number,
): string {
  const flagLat = latLng.lat > unitLat;
  const flagLng = latLng.lng > unitLng;
  latLng.lat -= flagLat ? unitLat : 0;
  latLng.lng -= flagLng ? unitLng : 0;
  return `${Number(flagLat) * 2 + Number(flagLng) + 1}`;
}
