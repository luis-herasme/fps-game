import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import { input } from "./core/input";
import { delay } from "./utils/delay";
import { ecs, gameManager } from "./manager";
import { renderManager } from "./core/render-manager";
import { FirstPersonCameraControl } from "./first-person-camera";
import { assetsManager } from "./core/assets-manager";
import { AudioManager } from "./core/audio-manage";
import { physicsWorld } from "./systems/physics/physics-world";
import { ANIMATIONS, audios } from "./constants";
import { MapLoader } from "./map-loader";
const audioManager = new AudioManager(audios);

export async function main() {
  await audioManager.load();
  await assetsManager.load({ textures: [...ANIMATIONS.gun1] });
  const entities = await MapLoader.loadMap("./scene1.glb");

  entities.forEach((entity) => {
    ecs.loadEntity(entity);
  });

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      transparent: true,
      alphaTest: 0.5,
      map: assetsManager.getTexture("gun1/1.png"),
    })
  );

  // Add offset to the sprite
  sprite.geometry.translate(0, -0.435, 0);

  const player = ecs.loadEntity({
    Mesh: new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
    ),
    Transform: {
      position: new THREE.Vector3(4, 4, 0),
      rotation: new THREE.Quaternion(),
      scale: new THREE.Vector3(0.5, 0.5, 0.5),
    },
    Collider: physicsWorld.createCollider(
      RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5).setTranslation(4, 4, 0)
    ),
    PlayerControl: {
      keys: {
        forward: "KeyW",
        backward: "KeyS",
        rotateLeft: "KeyA",
        rotateRight: "KeyD",
      },
      speed: -0.03,
    },
    Sprite: sprite,
  });

  let shooting = false;

  setInterval(async () => {
    if (input.mouseDown && !shooting) {
      const sprite = ecs.getComponent("Sprite", player)!;
      shooting = true;

      audioManager.play("shot.mp3");
      const transform = ecs.getComponent("Transform", player)!;

      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(transform.rotation);
      const offset = direction.clone().multiplyScalar(2);

      const ballPosition = transform.position.clone().add(offset);

      const rigidBody = physicsWorld.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic().setTranslation(
          ballPosition.x,
          ballPosition.y,
          ballPosition.z
        )
      );

      ecs.loadEntity({
        Mesh: new THREE.Mesh(
          new THREE.SphereGeometry(1, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
        ),
        Transform: {
          position: ballPosition.clone(),
          rotation: transform.rotation.clone(),
          scale: new THREE.Vector3(1, 1, 1),
        },
        Collider: physicsWorld.createCollider(
          RAPIER.ColliderDesc.ball(1),
          rigidBody
        ),
      });

      rigidBody.applyImpulse(
        new RAPIER.Vector3(
          direction.x * 300,
          direction.y * 300,
          direction.z * 300
        ),
        true
      );

      for (let i = 2; i <= 4; i++) {
        sprite.material.map = assetsManager.getTexture(`gun1/${i}.png`);
        await delay(100);
      }

      sprite.material.map = assetsManager.getTexture(`gun1/1.png`);
      shooting = false;
    }
  }, 20);

  ecs.loadEntity({
    Mesh: new THREE.Mesh(
      new THREE.SphereGeometry(5, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
    ),
    Transform: {
      position: new THREE.Vector3(0, 20, 0),
      rotation: new THREE.Quaternion(),
      scale: new THREE.Vector3(1, 1, 1),
    },
    Collider: physicsWorld.createCollider(
      RAPIER.ColliderDesc.ball(5).setTranslation(0, 20, 0).setRestitution(0.5),
      physicsWorld.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 20, 0)
      )
    ),
  });

  ecs.loadEntity({
    AmbientLight: new THREE.AmbientLight(0xffffff, 1.5),
    Transform: {
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Quaternion(),
      scale: new THREE.Vector3(1, 1, 1),
    },
  });

  const firstPersonCamera = new FirstPersonCameraControl(renderManager.camera, {
    distance: 5,
  });

  firstPersonCamera.follow(player);

  gameManager.start(() => {
    firstPersonCamera.update(ecs.deltaTime, ecs);
    ecs.update();
  });
}
