import { gameManager } from "../manager";
import { renderManager } from "../core/render-manager";

export const meshSystem = gameManager.ecs.createSystem({
  requiredComponents: ["Mesh", "Transform"],
  onEntityAdded(entity, ecs) {
    const mesh = ecs.getComponent("Mesh", entity)!;
    renderManager.scene.add(mesh);
  },
  onEntityRemoved(entity, ecs) {
    const mesh = ecs.getComponent("Mesh", entity)!;
    renderManager.scene.remove(mesh);
  },
  update(entities, ecs) {
    entities.forEach((entity) => {
      const transform = ecs.getComponent("Transform", entity)!;
      const mesh = ecs.getComponent("Mesh", entity)!;
      mesh.position.copy(transform.position);
      mesh.quaternion.copy(transform.rotation);
      mesh.scale.copy(transform.scale);
    });
  },
});
