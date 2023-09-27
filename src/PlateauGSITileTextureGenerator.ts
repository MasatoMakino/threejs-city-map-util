import SphericalMercator from "@mapbox/sphericalmercator";
import { mkdir } from "fs/promises";
import { join } from "path";
import Sharp from "sharp";
import {
  BoundingBox,
  SphericalMercatorUtil,
  XYBounds,
} from "./SphericalMercatorUtil.js";
import { JapanStandardRegionalMeshUtil } from "./JapanStandardRegionalMeshUtil.js";
import { Rectangle } from "./Rectangle.js";

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
    const textureSize = this.generateTextureSizeOption(meshCode, tileOption);
    if (textureSize == null) return undefined;

    const buffers = await this.downloadTiles(
      textureSize.xyz,
      tileOption.style,
      tileOption.zoomLevel,
    );
    const image = await this.jointTile(
      buffers,
      textureSize.xyz.maxX - textureSize.xyz.minX + 1,
      tileOption.tileSize,
      textureSize.region,
    );

    return await this.saveToFile(
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
    const bbox = this.getBBox(meshCode);
    if (bbox == null) return undefined;

    const sphericalMercator = new SphericalMercator({
      size: tileOption.tileSize,
    });
    const xyz = sphericalMercator.xyz(bbox, tileOption.zoomLevel);
    const region = this.getRegion(sphericalMercator, xyz, bbox, tileOption);
    if (xyz == null || region == null) return undefined;

    return {
      xyz,
      region,
    };
  }
  private static getBBox(code: string): BoundingBox | undefined {
    const meshLatLng = JapanStandardRegionalMeshUtil.toLatitudeLongitude(code);
    if (meshLatLng == null) return;

    const north =
      meshLatLng.lat + JapanStandardRegionalMeshUtil.MeshCodeLatitudeUnit;
    const east =
      meshLatLng.lng + JapanStandardRegionalMeshUtil.MeshCodeLongitudeUnit;
    return [meshLatLng.lng, meshLatLng.lat, east, north];
  }

  private static getInnerRectangle(
    sphericalMercator: SphericalMercator,
    bbox: BoundingBox,
    tileOption: Required<PlateauGSITileOption>,
  ) {
    const px = sphericalMercator.px(
      SphericalMercatorUtil.cutBBoxToLatLngPoint(bbox, "SouthWest"),
      tileOption.zoomLevel,
    );
    const px2 = sphericalMercator.px(
      SphericalMercatorUtil.cutBBoxToLatLngPoint(bbox, "NorthEast"),
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
    const inner = this.getInnerRectangle(sphericalMercator, bbox, tileOption);
    const size = inner.size();
    if (size.width < tileOption.tileSize || size.height < tileOption.tileSize) {
      console.warn(
        `three-city-map-util : ${size.width} * ${size.height} Output image size is smaller than tile size ${tileOption.tileSize}. Increase zoomLevel. `,
      );
      return undefined;
    }

    const outer = this.getOuterRectangle(xyz, tileOption);
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
    const promises: Promise<any>[] = [];
    for (let y = xyz.minY; y <= xyz.maxY; y++) {
      for (let x = xyz.minX; x <= xyz.maxX; x++) {
        const url = `https://cyberjapandata.gsi.go.jp/xyz/${style}/${zoomLevel}/${x}/${y}.jpg`;
        promises.push(this.getImage(url));
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

export class PlateauGSITileOption {
  /**
   * タイルの詳細度
   * @see https://maps.gsi.go.jp/development/siyou.html#siyou-zm
   */
  zoomLevel?: number;
  /**
   * タイルの種類
   *
   * API URL https://cyberjapandata.gsi.go.jp/xyz/{style}/{z}/{x}/{y}.{ext}
   * のスタイル部分に相当する。
   *
   * @see https://maps.gsi.go.jp/development/ichiran.html
   * @default seamlessphoto
   */
  style?: string;
  /**
   * 1タイルの画素数。
   * 国土地理院タイルでは原則256ピクセル。
   * @default 256
   */
  tileSize?: number;
  /**
   * 生成した画像ファイルを保存するディレクトリ
   * @default gsiTexture
   */
  imgDir?: string | string[];

  public static init(
    option?: PlateauGSITileOption,
  ): Required<PlateauGSITileOption> {
    option ??= {};
    option.zoomLevel = option?.zoomLevel ?? 16;
    option.style = option?.style ?? "seamlessphoto";
    option.tileSize = option?.tileSize ?? 256;
    option.imgDir = option?.imgDir ?? ["gsiTexture"];
    return option as Required<PlateauGSITileOption>;
  }
}
