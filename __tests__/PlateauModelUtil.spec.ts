import { Vector3 } from "three";
import { JapanStandardRegionalMeshUtil, LatitudeLongitude } from "../src";
import { PlateauModelUtil } from "../src/PlateauModelLoader";

describe("PlateauModelUtil", () => {
  const header =
    '# COORDINATE_SYSTEM:  OGC_DEF PROJCS["JGD2011 / Japan Plane Rectangular CS IX",GEOGCS["JGD2011",DATUM["Japanese_Geodetic_Datum_2011",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],AUTHORITY["EPSG","1128"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","6668"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",36],PARAMETER["central_meridian",139.833333333333],PARAMETER["scale_factor",0.9999],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AUTHORITY["EPSG","6677"]]';

  test("file name to mesh code", () => {
    const code = PlateauModelUtil.getMeshCode(
      "13100_tokyo23-ku_2020_obj_3_op/bldg/lod1/53393599_bldg_6677.obj"
    );
    expect(code).toBe("53393599");
  });

  test("get origin from file name", () => {
    const filePath = "../demoSrc/53393599_bldg_6677.obj";
    const meshCode = PlateauModelUtil.getMeshCode(filePath);
    const meshLatLng = JapanStandardRegionalMeshUtil.toLatitudeLongitude(
      meshCode
    ) as LatitudeLongitude;
    expect(meshLatLng).toStrictEqual(
      new LatitudeLongitude(35.65833333333333, 139.7375)
    );

    const zone = PlateauModelUtil.getZone(header);
    expect(PlateauModelUtil.getShiftMeters(meshLatLng, zone)).toEqual(
      new Vector3(-8676.937623270216, 0, 37901.890132395085)
    );
  });

  test("return undefined for incorrect filenames", () => {
    expect(
      PlateauModelUtil.getMeshCode("incorrect_file_name.obj")
    ).toBeUndefined();
  });

  test("return zone", () => {
    expect(PlateauModelUtil.getZone(header)).toEqual(
      new LatitudeLongitude(36, 139.833333333333)
    );
  });
  test("return undefined for incorrect header", () => {
    expect(PlateauModelUtil.getZone("this is not obj file.")).toBeUndefined();
  });

  test("getShiftMeters return undefined with nullable params", () => {
    expect(PlateauModelUtil.getShiftMeters()).toBeUndefined();
    expect(
      PlateauModelUtil.getShiftMeters(new LatitudeLongitude())
    ).toBeUndefined();
  });
});
