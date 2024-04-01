import { Components } from "./components";
import { GameManager } from "./core/game-manager";
import { MeshSystem } from "./systems/mesh-system";
import { LightSystem } from "./systems/light-system";
import { AliasSystem } from "./systems/alias-system";
import { SpriteSystem } from "./systems/sprite-system";
import { PhysicsSystem } from "./systems/physics/physics-system";
import { PlayerControlSystem } from "./systems/player-control-system";
import { ECS } from "./lib/ecs";

export const ecs = new ECS<Components>();
export const gameManager = new GameManager();

ecs.addSystem(new MeshSystem());
ecs.addSystem(new SpriteSystem());
ecs.addSystem(new PlayerControlSystem());
ecs.addSystem(new LightSystem());
ecs.addSystem(new AliasSystem());
ecs.addSystem(new PhysicsSystem());
