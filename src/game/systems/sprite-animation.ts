import { Components } from "../components";
import { assetsManager } from "../core/assets-manager";
import { renderManager } from "../core/render-manager";
import { ECS, Entity, RC, System } from "../lib/ecs";
import { delay } from "../utils/delay";

export class SpriteAnimation implements System<Components> {
  requiredComponents: RC<Components> = ["SpriteAnimation", "Transform"];

  private async playAnimation(entity: Entity, ecs: ECS<Components>) {
    const spriteAnimation = ecs.getComponent("SpriteAnimation", entity)!;

    for (const frame of spriteAnimation.frames) {
      spriteAnimation.sprite.material.map = assetsManager.getTexture(frame);
      await delay(spriteAnimation.frameDuration);
    }

    spriteAnimation.sprite.material.map = assetsManager.getTexture(
      spriteAnimation.defaultFrame
    );

    spriteAnimation.active = false;
  }

  onEntityAdded(entity: Entity, ecs: ECS<Components>) {
    const spriteAnimation = ecs.getComponent("SpriteAnimation", entity)!;
    renderManager.scene.add(spriteAnimation.sprite);
  }

  onEntityRemoved(entity: Entity, ecs: ECS<Components>) {
    const spriteAnimation = ecs.getComponent("SpriteAnimation", entity)!;
    renderManager.scene.remove(spriteAnimation.sprite);
  }

  update(entities: Set<Entity>, ecs: ECS<Components>) {
    entities.forEach((entity) => {
      const transform = ecs.getComponent("Transform", entity)!;
      const spriteAnimation = ecs.getComponent("SpriteAnimation", entity)!;
      spriteAnimation.sprite.position.copy(transform.position);
      spriteAnimation.sprite.quaternion.copy(transform.rotation);
      spriteAnimation.sprite.scale.copy(transform.scale);

      if (spriteAnimation.shouldBeActive && !spriteAnimation.active) {
        spriteAnimation.shouldBeActive = false;
        spriteAnimation.active = true;
        this.playAnimation(entity, ecs);
      }
    });
  }
}
