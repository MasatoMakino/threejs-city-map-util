export const fetchMock = async (url: string) => {
  return {
    ok: true,
    status: 200,
    text: async () => {
      return `
# Created with FME Version: FME(R) 2021.1.0.0 20210630 - Build 21607 - WIN64
# COORDINATE_SYSTEM:  OGC_DEF PROJCS["JGD2011 / Japan Plane Rectangular CS IX",GEOGCS["JGD2011",DATUM["Japanese_Geodetic_Datum_2011",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],AUTHORITY["EPSG","1128"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","6668"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",36],PARAMETER["central_meridian",139.833333333333],PARAMETER["scale_factor",0.9999],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AUTHORITY["EPSG","6677"]]
# Number of Geometry Coordinates  : 3
# Number of Texture  Coordinates  : 0
# Number of Normal   Coordinates  : 0
   v -8234.160500 -37035.870200 24.802000
   v -8235.650500 -37039.034900 24.802000
   v -8256.108700 -37029.452100 24.802000
# Number of Elements in set       : 1
   f 1 2 3
# Total Number of Elements in file: 1
# EOF
`;
    },
  };
};
