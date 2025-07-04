/**
 * Utility functions for handling spherical mercator projections and bounding boxes.
 */

export function cutBBoxToLatLngPoint(
  bbox: BoundingBox,
  style: "NorthEast" | "SouthWest",
): LatLngPoint {
  switch (style) {
    case "SouthWest":
      return [bbox[0], bbox[1]];
    case "NorthEast":
      return [bbox[2], bbox[3]];
  }
}

export interface XYBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export type LatLngPoint = [number, number];
export type XYPoint = [number, number];
export type BoundingBox = [number, number, number, number];
export type Projection = "WGS84" | "900913";
