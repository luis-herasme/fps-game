import { Components } from "../../components";
import { ECS, Entity, RC, System } from "../../lib/ecs";
import RAPIER from "@dimforge/rapier3d-compat";
import { physicsWorld } from "./physics-world";

type Collisions = {
  entity1: Entity;
  entity2: Entity;
  started: boolean;
};

export class PhysicsSystem implements System<Components> {
  requiredComponents: RC<Components> = ["Transform", "Collider"];

  private eventQueue = new RAPIER.EventQueue(true);
  private handleMap = new Map<number, Entity>();
  private collisions: Collisions[] = [];

  onEntityAdded(entity: Entity, ecs: ECS<Components>) {
    const collider = ecs.getComponent("Collider", entity)!;
    this.handleMap.set(collider.handle, entity);
  }

  onEntityRemoved(entity: Entity, ecs: ECS<Components>) {
    const collider = ecs.getComponent("Collider", entity)!;

    physicsWorld.removeCollider(collider, false);

    const rigidBody = collider.parent();

    if (rigidBody) {
      physicsWorld.removeRigidBody(rigidBody);
    }

    this.handleMap.delete(collider.handle);
  }

  update(entities: Set<Entity>, ecs: ECS<Components>) {
    physicsWorld.step(this.eventQueue);

    this.collisions = [];

    this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      const entity1 = this.handleMap.get(handle1)!;
      const entity2 = this.handleMap.get(handle2)!;
      this.collisions.push({ entity1, entity2, started });
    });

    entities.forEach((entity) => {
      const transform = ecs.getComponent("Transform", entity)!;
      const collider = ecs.getComponent("Collider", entity)!;
      transform.position.copy(collider.translation());
      transform.rotation.copy(collider.rotation());
    });
  }
}
