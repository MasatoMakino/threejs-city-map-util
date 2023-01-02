import {Fog, Mesh, MeshBasicMaterial} from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { Common } from "./Common";
import { PlateauModelUtil} from "../src";

export class Demo {
  private renderer;
  private camera;
  private scene;
  constructor() {
    const W = 1280;
    const H = 640;

    this.scene = Common.initScene();
    // this.scene.fog = new Fog(0x000000, 80, 160);
    Common.initLight(this.scene);
    this.camera = Common.initCamera(this.scene, W, H);
    this.renderer = Common.initRenderer(W, H, { antialias: false });
    Common.initControl(this.camera, this.renderer);
    Common.initHelper(this.scene);

    this.load();
    this.render();
  }

  async load(){
    const model = await PlateauModelUtil.loadObjModel("./53393599_bldg_6677.obj");
    // console.log( model );
    // model.position.y += 37500;
    // model.position.x += 8200;
    this.scene.add( model );
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
