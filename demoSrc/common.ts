import {
  AmbientLight,
  AxesHelper,
  Camera,
  Color,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class Common {
  static initScene() {
    return new Scene();
  }

  static initLight(scene: Scene) {
    const ambientLight = new AmbientLight(0xffffff, Math.PI / 2);
    scene.add(ambientLight);
    return ambientLight;
  }

  static initCamera(
    scene: Scene,
    W: number,
    H: number,
    near = 0.01,
    far = 400000000000,
  ) {
    const camera = new PerspectiveCamera(45, W / H, near, far);
    camera.position.set(0, 0, 500);
    camera.updateMatrixWorld(false);
    scene.add(camera);
    return camera;
  }

  static initControl(camera: Camera, render: WebGLRenderer) {
    let domElement;
    if (render) {
      domElement = render.domElement;
    }
    const control = new OrbitControls(camera, domElement);
    control.update();
    return control;
  }

  static initRenderer(W: number, H: number, option: any) {
    option = Object.assign(
      {
        color: 0x888888,
      },
      option,
    );

    const renderer = new WebGLRenderer({});
    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(new Color(option.color));
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    return renderer;
  }

  static initHelper(scene: Scene) {
    const axesHelper = new AxesHelper(2000);
    scene.add(axesHelper);
    return axesHelper;
  }
}
