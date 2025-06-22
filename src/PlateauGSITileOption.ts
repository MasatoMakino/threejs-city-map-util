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
