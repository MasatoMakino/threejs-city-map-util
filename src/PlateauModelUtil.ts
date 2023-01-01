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
  static setModel(): void {}
}
