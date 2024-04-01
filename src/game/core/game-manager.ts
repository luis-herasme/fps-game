import { renderManager } from "./render-manager";

type MainLoop = () => void;

export class GameManager {
  // Internals
  private playing = false;
  private updateID: number = 0;
  private mainLoop: MainLoop | null = null;

  start(mainLoop: MainLoop) {
    if (this.playing) {
      return;
    }

    this.mainLoop = mainLoop;
    renderManager.start();
    this.playing = true;
    this.update();
  }

  stop() {
    if (!this.playing) {
      return;
    }

    renderManager.stop();
    this.playing = false;
    cancelAnimationFrame(this.updateID);
  }

  private update = () => {
    renderManager.update();
    this.mainLoop?.();
    this.updateID = requestAnimationFrame(this.update);
  };
}
