import SphericalMercator from "@mapbox/sphericalmercator";
import {JapanStandardRegionalMeshUtil} from "../src/JapanStandardRegionalMeshUtil";

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

    const meshLatLng = JapanStandardRegionalMeshUtil.toLatitudeLongitude(meshCode);
    if( meshLatLng == null ) return;

    const north = meshLatLng.lat + JapanStandardRegionalMeshUtil.MeshCodeLatitudeUnit;
    const east = meshLatLng.lng + JapanStandardRegionalMeshUtil.MeshCodeLongitudeUnit;

    const sphericalMercator = new SphericalMercator();
    const xyz = sphericalMercator.xyz([meshLatLng.lng, meshLatLng.lat, east, north], option.zoomLevel ?? 14);

    const promises:Promise<any>[] = []
    for ( let y = xyz.minY; y < xyz.maxY; y ++ ){
      for ( let x = xyz.minX; x < xyz.maxX; x++ ){
        const url =  `https://cyberjapandata.gsi.go.jp/xyz/${option.style}/${option.zoomLevel}/${x}/${y}.jpg`
        promises.push( this.getImage(url) )
      }
    }

    const images = await Promise.all(promises);
    console.log( images );
  }

  private static async getImage( url:string ):Promise<Blob>{
    const response = await fetch(url);
    return await response.blob();
  }
}


export class PlateauGSITileOption {
  zoomLevel?: number = 14;
  style?: string = "seamlessphoto";

  public static init(option?:PlateauGSITileOption):PlateauGSITileOption{
    option ??= {};
    option.zoomLevel ??= 14;
    option.style ??= "seamlessphoto"
    return  option;
  }
}
