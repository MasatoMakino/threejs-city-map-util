import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { SphericalMercator } from "@mapbox/sphericalmercator";
import Sharp from "sharp";
import {
  MeshCodeLatitudeUnit,
  MeshCodeLongitudeUnit,
  toLatitudeLongitude,
} from "./index.js";
import { PlateauGSITileOption } from "./PlateauGSITileOption.js";
import { Rectangle } from "./Rectangle.js";
import {
  type BoundingBox,
  cutBBoxToLatLngPoint,
  type XYBounds,
} from "./SphericalMercatorUtil.js";

/**
 * PlateauモデルのメッシュIDから、そのモデルにスナップするテクスチャを国土地理院タイルを利用して生成する
 *
 * @see : https://maps.gsi.go.jp/development/ichiran.html
 * @see : https://maps.gsi.go.jp/development/siyou.html
 */
export class PlateauGSITileTextureGenerator {
  public static async generate(
    meshCode: string,
    option?: PlateauGSITileOption,
  ) {
    const tileOption = PlateauGSITileOption.init(option);
    const textureSize =
      PlateauGSITileTextureGenerator.generateTextureSizeOption(
        meshCode,
        tileOption,
      );
    if (textureSize == null) return undefined;

    const buffers = await PlateauGSITileTextureGenerator.downloadTiles(
      textureSize.xyz,
      tileOption.style,
      tileOption.zoomLevel,
    );
    const image = await PlateauGSITileTextureGenerator.jointTile(
      buffers,
      textureSize.xyz.maxX - textureSize.xyz.minX + 1,
      tileOption.tileSize,
      textureSize.region,
    );

    return await PlateauGSITileTextureGenerator.saveToFile(
      meshCode,
      image,
      tileOption.imgDir,
      tileOption.zoomLevel,
    );
  }
  private static generateTextureSizeOption(
    meshCode: string,
    tileOption: Required<PlateauGSITileOption>,
  ) {
    const bbox = PlateauGSITileTextureGenerator.getBBox(meshCode);
    if (bbox == null) return undefined;

    const sphericalMercator = new SphericalMercator({
      size: tileOption.tileSize,
    });
    const xyz = sphericalMercator.xyz(bbox, tileOption.zoomLevel);
    const region = PlateauGSITileTextureGenerator.getRegion(
      sphericalMercator,
      xyz,
      bbox,
      tileOption,
    );
    if (xyz == null || region == null) return undefined;

    return {
      xyz,
      region,
    };
  }
  private static getBBox(code: string): BoundingBox | undefined {
    const meshLatLng = toLatitudeLongitude(code);
    if (meshLatLng == null) return;

    const north = meshLatLng.lat + MeshCodeLatitudeUnit;
    const east = meshLatLng.lng + MeshCodeLongitudeUnit;
    return [meshLatLng.lng, meshLatLng.lat, east, north];
  }

  private static getInnerRectangle(
    sphericalMercator: SphericalMercator,
    bbox: BoundingBox,
    tileOption: Required<PlateauGSITileOption>,
  ) {
    const px = sphericalMercator.px(
      cutBBoxToLatLngPoint(bbox, "SouthWest"),
      tileOption.zoomLevel,
    );
    const px2 = sphericalMercator.px(
      cutBBoxToLatLngPoint(bbox, "NorthEast"),
      tileOption.zoomLevel,
    );
    return new Rectangle(px[0], px2[1], px2[0], px[1]);
  }

  private static getOuterRectangle(
    xyz: XYBounds,
    tileOption: Required<PlateauGSITileOption>,
  ) {
    const size = tileOption.tileSize;
    return new Rectangle(
      xyz.minX * size,
      xyz.minY * size,
      (xyz.maxX + 1) * size,
      (xyz.maxY + 1) * size,
    );
  }

  private static getRegion(
    sphericalMercator: SphericalMercator,
    xyz: XYBounds,
    bbox: BoundingBox,
    tileOption: Required<PlateauGSITileOption>,
  ): Sharp.Region | undefined {
    const inner = PlateauGSITileTextureGenerator.getInnerRectangle(
      sphericalMercator,
      bbox,
      tileOption,
    );
    const size = inner.size();
    if (size.width < tileOption.tileSize || size.height < tileOption.tileSize) {
      console.warn(
        `three-city-map-util : ${size.width} * ${size.height} Output image size is smaller than tile size ${tileOption.tileSize}. Increase zoomLevel. `,
      );
      return undefined;
    }

    const outer = PlateauGSITileTextureGenerator.getOuterRectangle(
      xyz,
      tileOption,
    );
    return outer.extract(inner);
  }
  private static async getImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private static async downloadTiles(
    xyz: XYBounds,
    style: string,
    zoomLevel: number,
  ) {
    const promises: Promise<Buffer>[] = [];
    for (let y = xyz.minY; y <= xyz.maxY; y++) {
      for (let x = xyz.minX; x <= xyz.maxX; x++) {
        const url = `https://cyberjapandata.gsi.go.jp/xyz/${style}/${zoomLevel}/${x}/${y}.jpg`;
        promises.push(PlateauGSITileTextureGenerator.getImage(url));
      }
    }
    return await Promise.all<Buffer>(promises);
  }

  private static async jointTile(
    buffers: Buffer[],
    langeX: number,
    tileSize: number,
    extract: Sharp.Region,
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
      },
    );

    image.composite(compositeBlobs);
    image.jpeg();
    return image;
  }

  private static async saveToFile(
    meshCode: string,
    image: Sharp.Sharp,
    imgDir: string | string[],
    zoomLevel: number,
  ) {
    if (!Array.isArray(imgDir)) {
      imgDir = [imgDir];
    }
    const dir = join(process.cwd(), ...imgDir);
    await mkdir(dir, { recursive: true });
    return await image.toFile(`${dir}/${meshCode}_${zoomLevel}.jpg`);
  }
}
