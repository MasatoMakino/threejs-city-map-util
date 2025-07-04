import type { Mesh } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import {
  JapanStandardRegionalMeshUtil,
  type LatitudeLongitude,
  toTransverseMercatorXZ,
} from "./index.js";
import { getMeshCode, getShiftMeters, getZone } from "./PlateauModelUtil.js";

/**
 * PLATEAUモデルをロードし、コンテナ内に配置できるよう回転・位置調整する。
 */
export async function loadAndOrientPlateauModel(
  url: string,
  origin: LatitudeLongitude,
): Promise<Mesh | undefined> {
  const txt = await fetch(url);
  const str = await txt.text();

  const meshCode = getMeshCode(url);
  const meshCodeLatLng =
    JapanStandardRegionalMeshUtil.toLatitudeLongitude(meshCode);
  const zone = getZone(str);
  const shift = getShiftMeters(meshCodeLatLng, zone);
  if (meshCodeLatLng == null || shift == null) {
    return undefined;
  }
  const group = new OBJLoader().parse(str);
  const mesh = group.children[0] as Mesh;
  if (mesh == null) return undefined;

  mesh.userData.meshCode = meshCode;
  mesh.userData.meshCodeLatLng = meshCodeLatLng;
  mesh.userData.zone = zone;
  mesh.userData.origin = origin;

  //shift geometry
  mesh.geometry.translate(-shift.x, shift.z, 0);
  mesh.geometry.rotateX(-Math.PI / 2);

  //shift mesh position
  const meshPos = toTransverseMercatorXZ(meshCodeLatLng, origin);
  mesh.position.add(meshPos);

  return mesh;
}

/**
 * @deprecated 代わりに `loadAndOrientPlateauModel` を使用してください。
 */
export async function loadObjModel(
  url: string,
  origin: LatitudeLongitude,
): Promise<Mesh | undefined> {
  return loadAndOrientPlateauModel(url, origin);
}
