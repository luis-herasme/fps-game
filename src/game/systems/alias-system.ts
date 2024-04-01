import { Entity } from "../lib/ecs";
import { gameManager } from "../manager";

export const aliasSystem = gameManager.ecs.createSystem({
  entitiesByAlias: new Map<string, Entity>(),
  requiredComponents: ["Alias"],
  onEntityAdded(entity) {
    const alias = gameManager.ecs.getComponent("Alias", entity)!;
    this.entitiesByAlias.set(alias, entity);
  },
  onEntityRemoved(entity) {
    const alias = gameManager.ecs.getComponent("Alias", entity)!;
    this.entitiesByAlias.delete(alias);
  },
});
