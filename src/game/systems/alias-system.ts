import { Components } from "../components";
import { ECS, Entity, RC, System } from "../lib/ecs";

export class AliasSystem implements System<Components> {
  requiredComponents: RC<Components> = ["Alias"];
  private entitiesByAlias = new Map<string, Entity>();

  onEntityAdded(entity: Entity, ecs: ECS<Components>) {
    const alias = ecs.getComponent("Alias", entity)!;
    this.entitiesByAlias.set(alias, entity);
  }

  onEntityRemoved(entity: Entity, ecs: ECS<Components>) {
    const alias = ecs.getComponent("Alias", entity)!;
    this.entitiesByAlias.delete(alias);
  }

  getEntityByAlias(alias: string): Entity | undefined {
    return this.entitiesByAlias.get(alias);
  }
}
