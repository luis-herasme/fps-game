import { Components } from "../components";
import { ECS, Entity, RC, System } from "../lib/ecs";
import { renderManager } from "../core/render-manager";

export class SpriteSystem implements System<Components> {
  requiredComponents: RC<Components> = ["Sprite", "Transform"];

  onEntityAdded(entity: Entity, ecs: ECS<Components>) {
    const sprite = ecs.getComponent("Sprite", entity)!;
    renderManager.scene.add(sprite);
  }

  onEntityRemoved(entity: Entity, ecs: ECS<Components>) {
    const sprite = ecs.getComponent("Sprite", entity)!;
    renderManager.scene.remove(sprite);
  }

  update(entities: Set<Entity>, ecs: ECS<Components>) {
    entities.forEach((entity) => {
      const transform = ecs.getComponent("Transform", entity)!;
      const sprite = ecs.getComponent("Sprite", entity)!;
      sprite.position.copy(transform.position);
      sprite.quaternion.copy(transform.rotation);
      sprite.scale.copy(transform.scale);
    });
  }
}
