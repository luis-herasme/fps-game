import { Vector2 } from "three";

class Input {
  readonly keys: Set<string> = new Set();
  readonly mouse = new Vector2();
  public mouseDown = false;

  constructor() {
    this.start();
  }

  private onMouseDown = () => {
    this.mouseDown = true;
  };

  private onMouseUp = () => {
    this.mouseDown = false;
  };

  private onKeyDown = (event: KeyboardEvent) => {
    this.keys.add(event.code);
  };

  private onKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.code);
  };

  private onMouseMove = (event: MouseEvent) => {
    this.mouse.x += event.movementX;
    this.mouse.y += event.movementY;
  };

  start() {
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  stop() {
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}

export const input = new Input();
