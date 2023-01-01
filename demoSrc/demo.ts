import { Fog } from "three";
import { Common } from "./Common";

export class Demo {

    private renderer;
    private camera;
    private scene;
  constructor() {
    const W = 640;
    const H = 480;

    this.scene = Common.initScene();
    this.scene.fog = new Fog(0x000000, 80, 160);
    Common.initLight(this.scene);
    this.camera = Common.initCamera(this.scene, W, H);
    this.renderer = Common.initRenderer(W, H, { antialias: false });
    Common.initControl(this.camera, this.renderer);
    Common.initHelper(this.scene);
    this.render();
  }

  render(){
      requestAnimationFrame(() => { this.render(); });
      this.renderer.render(this.scene, this.camera);
  }


}

window.onload = () => {
  new Demo();
};
