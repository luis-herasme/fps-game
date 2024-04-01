import { ECS } from "../lib/ecs";
import { renderManager } from "./render-manager";

type MainLoop = () => void;

export class GameManager<Components> {
  ecs: ECS<Components> = new ECS();

  // Internals
  private playing = false;
  private updateID: number = 0;
  private mainLoop: MainLoop | null = null;

  loadEntity(components: Partial<Components>) {
    const newEntity = this.ecs.addEntity();

    for (const key in components) {
      this.ecs.addComponent(newEntity, key, components[key]!);
    }

    return newEntity;
  }

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
    this.ecs.update();
    this.updateID = requestAnimationFrame(this.update);
  };
}
