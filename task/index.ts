import {JapanStandardRegionalMeshUtil} from "../src";

const lngLat = JapanStandardRegionalMeshUtil.toLongitudeLatitude("5339");
const lngLat2 = JapanStandardRegionalMeshUtil.toLongitudeLatitude("533946");
const lngLat3 = JapanStandardRegionalMeshUtil.toLongitudeLatitude("53394654");
console.log( lngLat3,"35.70832309409071, 139.79999655889745" )//35.70832309409071, 139.79999655889745

const error01 =  JapanStandardRegionalMeshUtil.toLongitudeLatitude("4N835@@");
const error02 = JapanStandardRegionalMeshUtil.toLongitudeLatitude("2");
const error03 = JapanStandardRegionalMeshUtil.toLongitudeLatitude("22222");
const error04 = JapanStandardRegionalMeshUtil.toLongitudeLatitude("2222233333333333");