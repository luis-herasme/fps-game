// Entities
export type Entity = number;
export type EntityDefinition<Components> = Partial<Components>;

// Systems
export interface System<T> {
  readonly requiredComponents: RC<T>;
  update?(entities: Set<Entity>, ecs: ECS<T>): void;
  onEntityAdded?(entity: Entity, ecs: ECS<T>): void;
  onEntityRemoved?(entity: Entity, ecs: ECS<T>): void;
}

export type RC<T> = (keyof T)[];

// ECS
export class ECS<T> {
  systems = new Map<System<T>, Set<Entity>>();
  entities = new Map<Entity, Map<keyof T, T[keyof T]>>();
  private lastTime = 0;
  deltaTime = 0;
  private nextEntityID = 0;
  private entitiesToDestroy = new Array<Entity>();

  // Entities
  public addEntity(): Entity {
    const entity = this.nextEntityID++;
    this.entities.set(entity, new Map());
    return entity;
  }

  public removeEntity(entity: Entity): void {
    this.entitiesToDestroy.push(entity);
  }

  loadEntity(components: EntityDefinition<T>) {
    const newEntity = this.addEntity();

    for (const key in components) {
      this.addComponent(newEntity, key, components[key]!);
    }

    return newEntity;
  }

  // Components
  getComponent<K extends keyof T>(type: K, entity: Entity) {
    return this.entities.get(entity)?.get(type) as T[K] | undefined;
  }

  addComponent<K extends keyof T>(entity: Entity, type: K, data: T[K]) {
    this.entities.get(entity)!.set(type, data);
    this.updateEntitySystems(entity);
  }

  removeComponent<Key extends keyof T>(entity: Entity, type: Key) {
    this.entities.get(entity)!.delete(type);
    this.updateEntitySystems(entity);
  }

  // Systems
  createSystem<S extends System<T>>(system: S) {
    return system;
  }

  addSystem<S extends System<T>>(system: S) {
    this.systems.set(system, new Set());

    for (const entity of this.entities.keys()) {
      this.updateEntitySystems(entity);
    }

    return system;
  }

  deleteSystem(system: System<T>) {
    if (system.onEntityRemoved) {
      for (const entity of this.systems.get(system)!) {
        system.onEntityRemoved(entity, this);
      }
    }

    this.systems.delete(system);
  }

  // Main loop
  public update(): void {
    const currentTime = performance.now();
    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    for (const [system, entities] of this.systems.entries()) {
      system.update?.(entities, this);
    }

    this.destroyEntities();
  }

  // Internals
  updateEntitySystems(entity: Entity): void {
    for (const [system, systemEntities] of this.systems) {
      const components = this.entities.get(entity)!;
      const hasEntity = systemEntities.has(entity);
      const hasRequiredComponents = system.requiredComponents.every((type) =>
        components.has(type)
      );

      if (hasRequiredComponents && !hasEntity) {
        systemEntities.add(entity);
        system.onEntityAdded?.(entity, this);
      } else if (!hasRequiredComponents && hasEntity) {
        systemEntities.delete(entity);
        system.onEntityRemoved?.(entity, this);
      }
    }
  }

  private destroyEntities(): void {
    for (const entity of this.entitiesToDestroy) {
      for (const [system, systemEntities] of this.systems) {
        if (systemEntities.has(entity)) {
          systemEntities.delete(entity);
          system.onEntityRemoved?.(entity, this);
        }
      }
      this.entities.delete(entity);
    }

    this.entitiesToDestroy = [];
  }
}
