import { input } from "./core/input";
import { clamp } from "./utils/clamp";
import { Components } from "./components";
import { Camera, Quaternion, Vector3 } from "three";
import { ECS, Entity } from "./lib/ecs";

type FirstPersonCameraConfig = {
  lastMousePosition: { x: number; y: number };
  rotationSpeed: number;
  lerpSpeed: number;
  theta: number;
  phi: number;
  distance: number;
  clamp?: {
    theta?: {
      min: number;
      max: number;
    };
    phi?: {
      min: number;
      max: number;
    };
  };
};

export class FirstPersonCameraControl {
  private camera: Camera;
  private entity: Entity | null = null;

  private config: FirstPersonCameraConfig = {
    lastMousePosition: { x: 0, y: 0 },
    rotationSpeed: 0.5,
    lerpSpeed: 0.02,
    theta: 0,
    phi: 0,
    distance: 5,
    clamp: {
      theta: {
        min: -Math.PI / 3,
        max: Math.PI / 3,
      },
    },
  };

  constructor(camera: Camera, config: Partial<FirstPersonCameraConfig> = {}) {
    this.camera = camera;
    this.config = { ...this.config, ...config };
  }

  follow(entity: Entity) {
    this.entity = entity;
  }

  stopFollowing() {
    this.entity = null;
  }

  update(delta: number, ecs: ECS<Components>) {
    if (this.entity === null) {
      return;
    }

    const collider = ecs.getComponent("Collider", this.entity);

    if (!collider) {
      return;
    }

    this.updateCameraRotation(delta);
    this.updateTransform(collider);
    this.updateCameraPosition(collider);
  }

  // Makes the transform look in the direction of the camera
  private updateTransform(collider: Components["Collider"]) {
    // const lookAt = new Quaternion();
    // lookAt.setFromAxisAngle(new Vector3(0, 1, 0), this.config.phi + Math.PI);
    // transform.rotation = lookAt;
    collider.setRotation(this.camera.quaternion.clone());
  }

  // Updates the camera position based on the transform
  private updateCameraPosition(collider: Components["Collider"]) {
    const cameraOffset = new Vector3(0, 0, 1);
    cameraOffset.applyQuaternion(this.camera.quaternion);
    cameraOffset.normalize().multiplyScalar(this.config.distance);
    this.camera.position.copy(cameraOffset.add(collider.translation()));
  }

  // Updates the camera rotation based on the mouse movement
  private updateCameraRotation(delta: number) {
    const mouseDelta = {
      x: input.mouse.x - this.config.lastMousePosition.x,
      y: input.mouse.y - this.config.lastMousePosition.y,
    };

    const xh = mouseDelta.x / window.innerWidth;
    const yh = mouseDelta.y / window.innerHeight;

    this.config.phi -= xh * delta * this.config.rotationSpeed;
    this.config.theta -= yh * delta * this.config.rotationSpeed;

    if (this.config.clamp?.theta) {
      this.config.theta = clamp(
        this.config.theta,
        this.config.clamp.theta.min,
        this.config.clamp.theta.max
      );
    }

    const phiRotation = new Quaternion().setFromAxisAngle(
      new Vector3(0, 1, 0),
      this.config.phi
    );

    const thetaRotation = new Quaternion().setFromAxisAngle(
      new Vector3(1, 0, 0),
      this.config.theta
    );

    this.camera.quaternion.slerp(
      phiRotation.multiply(thetaRotation),
      delta * this.config.lerpSpeed
    );

    this.config.lastMousePosition = { x: input.mouse.x, y: input.mouse.y };
  }
}
