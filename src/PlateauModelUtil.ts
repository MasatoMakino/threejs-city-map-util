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
  static async loadObjModel(
    url: string,
    origin: LatitudeLongitude
  ): Promise<Mesh | undefined> {
    const txt = await fetch(url);
    const str = await txt.text();

    const meshCode = PlateauModelUtil.getMeshCode(url);
    const meshCodeLatLng =
      JapanStandardRegionalMeshUtil.toLatitudeLongitude(meshCode);
    if (meshCodeLatLng == null) return undefined;

    const zone = this.getZone(str);
    const shift = this.getShiftMeters(meshCodeLatLng, zone);
    if (shift == null) return undefined;

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
    const meshPos = PositionUtil.toTransverseMercatorXZ(meshCodeLatLng, origin);
    mesh.position.add(meshPos);

    return mesh;
  }

  private static getZone = (objString: string) => {
    const getLatitudeOfOrigin = (str: string): number | undefined => {
      return this.getOrigin(str, /PARAMETER\["latitude_of_origin",([\d\.]+)\]/);
    };

    const getLongitudeOfOrigin = (str: string): number | undefined => {
      return this.getOrigin(str, /PARAMETER\["central_meridian",([\d\.]+)\]/);
    };

    return new LatitudeLongitude(
      getLatitudeOfOrigin(objString),
      getLongitudeOfOrigin(objString)
    );
  };

  private static getOrigin(str: string, pattern: RegExp): number | undefined {
    const match = str.match(pattern);
    if (match) {
      return Number(match[1]);
    }
    return undefined;
  }

  private static getShiftMeters = (
    meshCodeLatLng: LatitudeLongitude,
    zone: LatitudeLongitude
  ): Vector3 | undefined => {
    return PositionUtil.toTransverseMercatorXZ(meshCodeLatLng, zone);
  };
}
