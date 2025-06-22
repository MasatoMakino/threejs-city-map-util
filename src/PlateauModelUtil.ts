import type { Vector3 } from "three";
import { LatitudeLongitude } from "./LatitudeLongitude.js";
import { toTransverseMercatorXZ } from "./PositionUtil.js";

/**
 * PLATEAUモデル名から基準地域メッシュコードを取り出す。
 * @param modelName
 */
export function getMeshCode(modelName: string): string | undefined {
  const regex = /(\d+)_[\w]+_\d+\.[a-z]+$/;
  const match = modelName.match(regex);
  if (match == null) {
    return undefined;
  }
  return match[1];
}

/**
 * Get the zone information from the object string.
 */
export function getZone(objString: string): LatitudeLongitude | undefined {
  const lat = getOrigin(
    objString,
    /PARAMETER\["latitude_of_origin",([\d.]+)\]/,
  );
  const lng = getOrigin(objString, /PARAMETER\["central_meridian",([\d.]+)\]/);
  if (lat && lng) {
    return new LatitudeLongitude(lat, lng);
  }
  return undefined;
}

/**
 * Extract origin information from a string using a pattern.
 */
function getOrigin(str: string, pattern: RegExp): number | undefined {
  const match = str.match(pattern);
  if (match) {
    return Number(match[1]);
  }
  return undefined;
}

/**
 * Calculate shift meters based on mesh code and zone.
 */
export function getShiftMeters(
  meshCodeLatLng?: LatitudeLongitude,
  zone?: LatitudeLongitude,
): Vector3 | undefined {
  if (meshCodeLatLng == null || zone == null) return undefined;
  return toTransverseMercatorXZ(meshCodeLatLng, zone);
}
