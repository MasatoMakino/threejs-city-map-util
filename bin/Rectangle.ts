import Sharp from "sharp";
export class Rectangle {
  constructor(
    public x1: number,
    public y1: number,
    public x2: number,
    public y2: number
  ) {}

  extract(inner: Rectangle): Sharp.Region {
    return {
      ...inner.size(),
      left: inner.x1 - this.x1,
      top: inner.y1 - this.y1,
    };
  }

  size(): { width: number; height: number } {
    return {
      width: this.x2 - this.x1,
      height: this.y2 - this.y1,
    };
  }
}
