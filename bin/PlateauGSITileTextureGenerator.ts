import SphericalMercator from "@mapbox/sphericalmercator";
import Sharp from "sharp";
import { JapanStandardRegionalMeshUtil } from "../src/JapanStandardRegionalMeshUtil";

/**
 *
 * @see : https://maps.gsi.go.jp/development/ichiran.html
 * @see : https://maps.gsi.go.jp/development/siyou.html
 */
export class PlateauGSITileTextureGenerator {
  public static async generate(
    meshCode: string,
    option?: PlateauGSITileOption
  ) {
    option = PlateauGSITileOption.init(option);

    const meshLatLng =
      JapanStandardRegionalMeshUtil.toLatitudeLongitude(meshCode);
    if (meshLatLng == null) return;

    const north =
      meshLatLng.lat + JapanStandardRegionalMeshUtil.MeshCodeLatitudeUnit;
    const east =
      meshLatLng.lng + JapanStandardRegionalMeshUtil.MeshCodeLongitudeUnit;

    const sphericalMercator = new SphericalMercator();
    const xyz = sphericalMercator.xyz(
      [meshLatLng.lng, meshLatLng.lat, east, north],
      option.zoomLevel ?? 14
    );

    const promises: Promise<any>[] = [];
    for (let y = xyz.minY; y <= xyz.maxY; y++) {
      for (let x = xyz.minX; x <= xyz.maxX; x++) {
        const url = `https://cyberjapandata.gsi.go.jp/xyz/${option.style}/${option.zoomLevel}/${x}/${y}.jpg`;
        promises.push(this.getImage(url));
      }
    }

    const blobs = await Promise.all(promises);
    const image = await this.jointTile(
      blobs,
      xyz.maxX - xyz.minX + 1,
      option.tileSize as number
    );
    const file = await image.toFile(
      `./img/${meshCode}_${option.zoomLevel}.jpg`
    );
  }

  private static async getImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private static async jointTile(
    buffers: Buffer[],
    langeX: number,
    tileSize: number
  ) {
    const image = Sharp({
      create: {
        width: tileSize * langeX,
        height: tileSize * Math.ceil(buffers.length / langeX),
        channels: 3,
        background: { b: 0, g: 0, r: 0 },
      },
    });

    const compositeBlobs: Sharp.OverlayOptions[] = buffers.map(
      (buffer, index) => {
        const x = index % langeX;
        const y = Math.floor(index / langeX);
        return {
          input: buffer,
          left: x * tileSize,
          top: y * tileSize,
        };
      }
    );

    image.composite(compositeBlobs);
    image.jpeg();
    return image;
  }
}

export class PlateauGSITileOption {
  zoomLevel?: number = 14;
  style?: string = "seamlessphoto";
  tileSize?: number = 256;

  public static init(option?: PlateauGSITileOption): PlateauGSITileOption {
    option ??= {};
    option.zoomLevel ??= 14;
    option.style ??= "seamlessphoto";
    option.tileSize ??= 256;
    return option;
  }
}
