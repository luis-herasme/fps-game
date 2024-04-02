import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import { ecs, gameManager } from "./manager";
import { renderManager } from "./core/render-manager";
import { FirstPersonCameraControl } from "./first-person-camera";
import { assetsManager } from "./core/assets-manager";
import { AudioManager } from "./core/audio-manage";
import { physicsWorld } from "./systems/physics/physics-world";
import { ANIMATIONS, audios } from "./constants";
import { MapLoader } from "./map-loader";
import { input } from "./core/input";

export const audioManager = new AudioManager(audios);

export async function main() {
  await audioManager.load();
  await assetsManager.load({ textures: [...ANIMATIONS.gun1] });
  const entities = await MapLoader.loadMap("./scene1.glb");

  entities.forEach((entity) => {
    ecs.loadEntity(entity);
  });

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: assetsManager.getTexture("gun1/1.png"),
    })
  );

  sprite.geometry.translate(0, -0.435, 0).scale(0.5, 0.5, 0.5);

  const player = ecs.loadEntity({
    Mesh: new THREE.Mesh(
      new THREE.CapsuleGeometry(5, 15),
      new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
    ),
    Transform: {
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Quaternion(),
      scale: new THREE.Vector3(1, 1, 1),
    },
    Collider: physicsWorld.createCollider(
      RAPIER.ColliderDesc.capsule(7.5, 4).setTranslation(4, 7.5, 0),
      physicsWorld.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic().setTranslation(4, 4, 0).lockRotations()
      )
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
    SpriteAnimation: {
      frames: ANIMATIONS.gun1,
      frameDuration: 100,
      defaultFrame: "gun1/1.png",
      active: false,
      shouldBeActive: false,
      sprite,
    },
    Shoot: {
      audio: "shot.mp3",
      shooting: false,
      shouldShoot: false,
      duration: 500,
      bulletSeparation: 2,
    },
  });

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
    distance: 1,
  });

  firstPersonCamera.follow(player);

  gameManager.start(() => {
    firstPersonCamera.update(ecs.deltaTime, ecs);
    ecs.update();

    if (input.mouseDown && !ecs.getComponent("Shoot", player)!.shooting) {
      ecs.getComponent("Shoot", player)!.shouldShoot = true;
      ecs.getComponent("SpriteAnimation", player)!.shouldBeActive = true;
    }
  });
}
