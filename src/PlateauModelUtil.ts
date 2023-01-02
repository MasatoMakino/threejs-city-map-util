import {
  JapanStandardRegionalMeshUtil,
  LatitudeLongitude,
  PositionUtil,
} from "./";
import { Mesh, Vector3 } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

export class PlateauModelUtil {
  /**
   * PLATEAUモデル名から基準地域メッシュコードを取り出す。
   * @param modelName
   */
  static getMeshCode(modelName: string): string | undefined {
    const regex = /(\d+)_[\w]+_\d+\.[a-z]+$/;
    const match = modelName.match(regex);
    if (match == null) {
      return undefined;
    }
    return match[1];
  }

  /**
   * PLATEAUモデルをロードし、コンテナ内に配置できるよう回転する。
   */
  static async loadObjModel(url: string): Promise<Mesh | undefined> {
    const txt = await fetch(url);
    const str = await txt.text();
    const shift = this.getShiftMeters(url, str);
    if (shift == null) return undefined;

    const group = new OBJLoader().parse(str);
    const mesh = group.children[0] as Mesh;
    if (mesh == null) return undefined;

    mesh.position.x -= shift.x;
    mesh.position.y -= shift.z;
    return mesh;
  }

  private static getShiftMeters = (
    url: string,
    objString: string
  ): Vector3 | undefined => {
    const getLatitudeOfOrigin = (str: string): number | undefined => {
      const match = str.match(/PARAMETER\["latitude_of_origin",([\d\.]+)\]/);
      if (match) {
        return Number(match[1]);
      }
      return undefined;
    };
    const latitudeOfOrigin = getLatitudeOfOrigin(objString);

    const getLongitudeOfOrigin = (str: string): number | undefined => {
      const match = str.match(/PARAMETER\["central_meridian",([\d\.]+)\]/);
      if (match) {
        return Number(match[1]);
      }
      return undefined;
    };
    const longitudeOfOrigin = getLongitudeOfOrigin(objString);

    const meshCode = PlateauModelUtil.getMeshCode(url);
    if (meshCode == null) return undefined;
    const meshLatLng =
      JapanStandardRegionalMeshUtil.toLongitudeLatitude(meshCode);
    if (meshLatLng == null) return undefined;

    return PositionUtil.toTransverseMercatorXZ(
      meshLatLng,
      new LatitudeLongitude(latitudeOfOrigin, longitudeOfOrigin)
    );
  };
}
