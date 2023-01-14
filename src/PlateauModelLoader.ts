import {
  JapanStandardRegionalMeshUtil,
  LatitudeLongitude,
  PositionUtil,
} from "./";
import { Mesh, Vector3 } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

export class PlateauModelLoader {
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
    const zone = PlateauModelUtil.getZone(str);
    const shift = PlateauModelUtil.getShiftMeters(meshCodeLatLng, zone);
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
    const meshPos = PositionUtil.toTransverseMercatorXZ(meshCodeLatLng, origin);
    mesh.position.add(meshPos);

    return mesh;
  }
}

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

  public static getZone = (
    objString: string
  ): LatitudeLongitude | undefined => {
    const lat = this.getOrigin(
      objString,
      /PARAMETER\["latitude_of_origin",([\d\.]+)\]/
    );
    const lng = this.getOrigin(
      objString,
      /PARAMETER\["central_meridian",([\d\.]+)\]/
    );
    if (lat && lng) {
      return new LatitudeLongitude(lat, lng);
    }
    return undefined;
  };

  private static getOrigin(str: string, pattern: RegExp): number | undefined {
    const match = str.match(pattern);
    if (match) {
      return Number(match[1]);
    }
    return undefined;
  }

  public static getShiftMeters = (
    meshCodeLatLng?: LatitudeLongitude,
    zone?: LatitudeLongitude
  ): Vector3 | undefined => {
    if (meshCodeLatLng == null || zone == null) return undefined;
    return PositionUtil.toTransverseMercatorXZ(meshCodeLatLng, zone);
  };
}
