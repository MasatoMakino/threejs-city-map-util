import {
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  TextureLoader,
} from "three";
import { Common } from "./common.js";
import {
  LatitudeLongitude,
  PlateauModelLoader,
  PositionUtil,
} from "../esm/index.js";

export class Demo {
  private renderer;
  private camera;
  private scene;
  constructor() {
    const W = 1280;
    const H = 640;

    this.scene = Common.initScene();
    Common.initLight(this.scene);
    this.camera = Common.initCamera(this.scene, W, H);
    this.renderer = Common.initRenderer(W, H, { antialias: false });
    Common.initControl(this.camera, this.renderer);
    Common.initHelper(this.scene);

    this.load();

    this.render();
  }

  async load() {
    const origin = new LatitudeLongitude(
      35.65833333333333 + 2 / 3 / 8 / 10 / 2,
      139.7375 + 1 / 160,
    );
    const model = await PlateauModelLoader.loadObjModel(
      "./53393599_bldg_6677.obj",
      origin,
    );
    const dem = await PlateauModelLoader.loadObjModel(
      "./53393599_dem_6677.obj",
      origin,
    );

    if (dem) {
      const loader = new TextureLoader();
      const texture = loader.load("./53393599_18.jpg");
      texture.colorSpace = "srgb";
      dem.material = new MeshStandardMaterial({ map: texture });
      this.scene.add(dem);
    }
    if (model) {
      model.material = new MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
      });
      this.scene.add(model);

      const dummy = new Mesh(
        new SphereGeometry(10, 10),
        new MeshBasicMaterial(),
      );

      //東京タワー
      const targetLatLng = new LatitudeLongitude(
        35.65864183184921,
        139.74544075634395,
      );
      const targetPos = PositionUtil.toTransverseMercatorXZ(
        targetLatLng,
        model.userData.origin,
      );
      dummy.position.copy(targetPos);
      this.scene.add(dummy);

      const dummyTop = dummy.clone();
      dummyTop.position.y = 333;
      this.scene.add(dummyTop);
    }
  }
  render() {
    requestAnimationFrame(() => {
      this.render();
    });
    this.renderer.render(this.scene, this.camera);
  }
}

window.onload = () => {
  new Demo();
};
