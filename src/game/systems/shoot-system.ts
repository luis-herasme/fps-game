import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import { ECS, Entity, RC, System } from "../lib/ecs";
import { Components } from "../components";
import { physicsWorld } from "./physics/physics-world";
import { audioManager } from "..";
import { renderManager } from "../core/render-manager";

export class ShootSystem implements System<Components> {
  requiredComponents: RC<Components> = ["Transform", "Shoot"];

  private createBall(entity: Entity, ecs: ECS<Components>) {
    const transform = ecs.getComponent("Transform", entity)!;
    const shoot = ecs.getComponent("Shoot", entity)!;

    const direction = new THREE.Vector3(0, 0, -1);
    // TODO: Fix this
    direction.applyQuaternion(renderManager.camera.quaternion);
    const offset = direction.clone().multiplyScalar(shoot.bulletSeparation);

    const ballPosition = transform.position.clone().add(offset);

    const rigidBody = physicsWorld.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic().setTranslation(
        ballPosition.x,
        ballPosition.y,
        ballPosition.z
      )
    );

    ecs.loadEntity({
      Mesh: new THREE.Mesh(
        new THREE.SphereGeometry(1, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
      ),
      Transform: {
        position: ballPosition.clone(),
        rotation: transform.rotation.clone(),
        scale: new THREE.Vector3(1, 1, 1),
      },
      Collider: physicsWorld.createCollider(
        RAPIER.ColliderDesc.ball(1),
        rigidBody
      ),
    });

    rigidBody.applyImpulse(
      new RAPIER.Vector3(
        direction.x * 300,
        direction.y * 300,
        direction.z * 300
      ),
      true
    );
  }

  private timeouts: Map<Entity, number> = new Map();

  private stopAfterDuration(entity: Entity, ecs: ECS<Components>) {
    const shoot = ecs.getComponent("Shoot", entity)!;
    const currentTimeout = this.timeouts.get(entity);

    if (currentTimeout) {
      clearTimeout(currentTimeout);
    }

    const newTimeout = setTimeout(() => {
      shoot.shooting = false;
    }, shoot.duration);

    this.timeouts.set(entity, newTimeout);
  }

  update(entities: Set<Entity>, ecs: ECS<Components>) {
    for (const entity of entities) {
      const attack = ecs.getComponent("Shoot", entity)!;

      if (attack.shouldShoot && !attack.shooting) {
        attack.shouldShoot = false;
        attack.shooting = true;

        audioManager.play(attack.audio);
        this.createBall(entity, ecs);
        this.stopAfterDuration(entity, ecs);
      }
    }
  }
}
