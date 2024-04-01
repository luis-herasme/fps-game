import { gameManager } from "../manager";
import { renderManager } from "../core/render-manager";

export const spriteSystem = gameManager.ecs.createSystem({
  requiredComponents: ["Sprite", "Transform"],
  onEntityAdded(entity, ecs) {
    const sprite = ecs.getComponent("Sprite", entity)!;
    renderManager.scene.add(sprite);
  },
  onEntityRemoved(entity, ecs) {
    const sprite = ecs.getComponent("Sprite", entity)!;
    renderManager.scene.remove(sprite);
  },
  update(entities, ecs) {
    entities.forEach((entity) => {
      const transform = ecs.getComponent("Transform", entity)!;
      const sprite = ecs.getComponent("Sprite", entity)!;
      sprite.position.copy(transform.position);
      sprite.quaternion.copy(transform.rotation);
      sprite.scale.copy(transform.scale);
    });
  },
});
