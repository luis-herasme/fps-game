import { input } from "../core/input";
import { Quaternion, Vector3 } from "three";
import { Components } from "../components";
import { Entity, ECS } from "../lib/ecs";
import { gameManager } from "../manager";
import { physicsWorld } from "./physics/physics-world";

const characterController = physicsWorld.createCharacterController(0);

export const playerControlSystem = gameManager.ecs.createSystem({
  requiredComponents: ["Transform", "PlayerControl", "Collider"],
  updatePosition(entity: Entity, ecs: ECS<Components>, delta: number) {
    const collider = ecs.getComponent("Collider", entity)!;
    const playerControl = ecs.getComponent("PlayerControl", entity)!;

    let running = false;
    let forwardSpeed = 0;
    let sideSpeed = 0;

    if (input.keys.has(playerControl.keys.forward)) {
      forwardSpeed += playerControl.speed;
    }

    if (input.keys.has(playerControl.keys.backward)) {
      forwardSpeed -= playerControl.speed;
    }

    if (input.keys.has(playerControl.keys.rotateLeft)) {
      sideSpeed -= playerControl.speed;
    }

    if (input.keys.has(playerControl.keys.rotateRight)) {
      sideSpeed += playerControl.speed;
    }

    if (input.keys.has("ShiftLeft") || input.keys.has("ShiftRight")) {
      forwardSpeed *= 2;
      sideSpeed *= 2;
      running = true;
    }

    // Direction should be only in the XZ plane
    const direction = new Quaternion().copy(collider.rotation());
    direction.normalize();

    const forward = new Vector3(0, 0, 1);
    forward.applyQuaternion(direction);
    forward.multiplyScalar(forwardSpeed * delta);

    const right = new Vector3(-1, 0, 0);
    right.applyQuaternion(direction);
    right.multiplyScalar(sideSpeed * delta);

    const deltaPosition = new Vector3();
    deltaPosition.add(forward);
    deltaPosition.add(right);

    characterController.computeColliderMovement(collider, deltaPosition);
    const correctedMovement = characterController.computedMovement();
    const translation = collider.translation();

    collider.setTranslation({
      x: translation.x + correctedMovement.x,
      y: translation.y + correctedMovement.y,
      z: translation.z + correctedMovement.z,
    });
  },
  update(entities, ecs) {
    for (const entity of entities) {
      this.updatePosition(entity, ecs, ecs.deltaTime);
    }
  },
});
