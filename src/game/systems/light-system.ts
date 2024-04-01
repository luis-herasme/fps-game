import { Components } from "../components";
import { ECS, Entity, RC, System } from "../lib/ecs";
import { renderManager } from "../core/render-manager";

export class LightSystem implements System<Components> {
  requiredComponents: RC<Components> = ["AmbientLight", "Transform"];

  onEntityAdded(entity: Entity, ecs: ECS<Components>) {
    const light = ecs.getComponent("AmbientLight", entity)!;
    renderManager.scene.add(light);
  }

  onEntityRemoved(entity: Entity, ecs: ECS<Components>) {
    const light = ecs.getComponent("AmbientLight", entity)!;
    renderManager.scene.remove(light);
  }

  update(entities: Set<Entity>, ecs: ECS<Components>) {
    entities.forEach((entity) => {
      const light = ecs.getComponent("AmbientLight", entity)!;
      const transform = ecs.getComponent("Transform", entity)!;
      light.position.copy(transform.position);
      light.quaternion.copy(transform.rotation);
    });
  }
}
