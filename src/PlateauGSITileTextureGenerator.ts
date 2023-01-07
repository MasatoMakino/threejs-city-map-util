import SphericalMercator from "@mapbox/sphericalmercator";
import { Rectangle } from "./Rectangle";
import Sharp from "sharp";
import { JapanStandardRegionalMeshUtil } from "./JapanStandardRegionalMeshUtil";

/**
 *
 * @see : https://maps.gsi.go.jp/development/ichiran.html
 * @see : https://maps.gsi.go.jp/development/siyou.html
 */
export class PlateauGSITileTextureGenerator {
  public static async generate(meshCode: string, option?: Option) {
    const tileOption = new PlateauGSITileOption(option);

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
      tileOption.zoomLevel
    );

    const px = sphericalMercator.px(
      [meshLatLng.lng, meshLatLng.lat],
      tileOption.zoomLevel
    );
    const px2 = sphericalMercator.px([east, north], tileOption.zoomLevel);
    const inner = new Rectangle(px[0], px2[1], px2[0], px[1]);

    const outer = new Rectangle(
      xyz.minX * tileOption.tileSize,
      xyz.minY * tileOption.tileSize,
      (xyz.maxX + 1) * tileOption.tileSize,
      (xyz.maxY + 1) * tileOption.tileSize
    );

    const promises: Promise<any>[] = [];
    for (let y = xyz.minY; y <= xyz.maxY; y++) {
      for (let x = xyz.minX; x <= xyz.maxX; x++) {
        const url = `https://cyberjapandata.gsi.go.jp/xyz/${tileOption.style}/${tileOption.zoomLevel}/${x}/${y}.jpg`;
        promises.push(this.getImage(url));
      }
    }

    const blobs = await Promise.all(promises);
    const image = await this.jointTile(
      blobs,
      xyz.maxX - xyz.minX + 1,
      tileOption.tileSize,
      outer.extract(inner)
    );

    await image.toFile(`./img/${meshCode}_${tileOption.zoomLevel}.jpg`);
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
    tileSize: number,
    extract: Sharp.Region
  ) {
    const image = Sharp({
      create: {
        width: extract.width,
        height: extract.height,
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
          left: x * tileSize - extract.left,
          top: y * tileSize - extract.top,
        };
      }
    );

    image.composite(compositeBlobs);
    image.jpeg();
    return image;
  }
}

export class Option {
  zoomLevel?: number;
  style?: string;
  tileSize?: number;
}

export class PlateauGSITileOption {
  zoomLevel: number;
  style: string;
  tileSize: number;

  constructor(option?: Option) {
    this.zoomLevel = option?.zoomLevel ?? 16;
    this.style = option?.style ?? "seamlessphoto";
    this.tileSize = option?.tileSize ?? 256;
  }
}
