import { renderManager } from "../core/render-manager";
import { gameManager } from "../manager";

export const lightSystem = gameManager.ecs.createSystem({
  requiredComponents: ["AmbientLight", "Transform"],
  onEntityAdded(entity, ecs) {
    const light = ecs.getComponent("AmbientLight", entity)!;
    renderManager.scene.add(light);
  },
  onEntityRemoved(entity, ecs) {
    const light = ecs.getComponent("AmbientLight", entity)!;
    renderManager.scene.remove(light);
  },
  update(entities, ecs) {
    entities.forEach((entity) => {
      const light = ecs.getComponent("AmbientLight", entity)!;
      const transform = ecs.getComponent("Transform", entity)!;
      light.position.copy(transform.position);
      light.quaternion.copy(transform.rotation);
    });
  },
});
