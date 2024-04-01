import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

class RenderManager {
  public scene = new Scene();
  public camera = new PerspectiveCamera();
  public renderer = new WebGLRenderer();
  private canvas = this.renderer.domElement;
  private playing = false;

  constructor() {
    document.body.appendChild(this.canvas);
  }

  start() {
    if (this.playing) {
      return;
    }

    this.playing = true;

    window.addEventListener("resize", this.onResizePerspectiveCamera);
    this.canvas.addEventListener("click", this.canvas.requestPointerLock);
    this.canvas.addEventListener("contextmenu", this.preventDefault);
    this.onResizePerspectiveCamera();
  }

  stop() {
    if (!this.playing) {
      return;
    }

    this.playing = false;

    window.removeEventListener("resize", this.onResizePerspectiveCamera);
    this.canvas.removeEventListener("click", this.canvas.requestPointerLock);
    this.canvas.removeEventListener("contextmenu", this.preventDefault);
  }

  update() {
    this.renderer.render(this.scene, this.camera);
  }

  private onResizePerspectiveCamera = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };

  private preventDefault = (event: Event) => event.preventDefault();
}

export const renderManager = new RenderManager();
