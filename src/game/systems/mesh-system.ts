import { Components } from "../components";
import { ECS, Entity, RC, System } from "../lib/ecs";
import { renderManager } from "../core/render-manager";

export class MeshSystem implements System<Components> {
  requiredComponents: RC<Components> = ["Mesh", "Transform"];

  onEntityAdded(entity: Entity, ecs: ECS<Components>) {
    const mesh = ecs.getComponent("Mesh", entity)!;
    renderManager.scene.add(mesh);
  }

  onEntityRemoved(entity: Entity, ecs: ECS<Components>) {
    const mesh = ecs.getComponent("Mesh", entity)!;
    renderManager.scene.remove(mesh);
  }

  update(entities: Set<Entity>, ecs: ECS<Components>) {
    entities.forEach((entity) => {
      const transform = ecs.getComponent("Transform", entity)!;
      const mesh = ecs.getComponent("Mesh", entity)!;
      mesh.position.copy(transform.position);
      mesh.quaternion.copy(transform.rotation);
      mesh.scale.copy(transform.scale);
    });
  }
}
