import * as THREE from "three";
import { gameManager } from "./manager";
import { meshSystem } from "./systems/mesh-system";
import { renderManager } from "./core/render-manager";
import { FirstPersonCameraControl } from "./first-person-camera";
import { playerControlSystem } from "./systems/player-control-system";
import { lightSystem } from "./systems/light-system";
import { aliasSystem } from "./systems/alias-system";
import { assetsManager } from "./core/assets-manager";
import { physicsSystem } from "./systems/physics/physics-system";
import RAPIER from "@dimforge/rapier3d-compat";
import { spriteSystem } from "./systems/sprite-system";
import { input } from "./core/input";
import { delay } from "./utils/delay";
import { AudioManager } from "./core/audio-manage";
import { deleteRecursive } from "./utils/delete-recursive";
import { physicsWorld } from "./systems/physics/physics-world";

const audioManager = new AudioManager(["shot.mp3"]);

const gun1Animation = ["gun1/1.png", "gun1/2.png", "gun1/3.png", "gun1/4.png"];

export async function main() {
  await audioManager.load();
  await assetsManager.load({
    textures: [...gun1Animation],
    gltfs: ["./scene1.glb"],
  });

  const gltf = assetsManager.getGLTF("./scene1.glb");
  renderManager.scene.add(gltf.scene);

  gltf.scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material.alphaTest = 0.5;
      child.material.roughness = 1;
    }
  });

  gltf.scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.userData.collider) {
      // Getting world position, rotation, and scale
      const position = child.getWorldPosition(new THREE.Vector3());
      const rotation = child.getWorldQuaternion(new THREE.Quaternion());
      const scale = child.getWorldScale(new THREE.Vector3());

      // Computing size based on the bounding box
      const boundingBox = new THREE.Box3().setFromObject(child);
      const size = new THREE.Vector3();
      boundingBox.getSize(size);

      const offset = child.geometry.boundingBox.getCenter(new THREE.Vector3());

      // Creating a mesh with the geometry and a basic yellow wireframe material
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(size.x, size.y, size.z),
        new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true })
      );

      // Loading the entity with the new mesh and its world transformation
      gameManager.loadEntity({
        Mesh: mesh,
        Transform: {
          position: new THREE.Vector3(
            position.x + offset.x * scale.x,
            position.y + offset.y * scale.y,
            position.z + offset.z * scale.z
          ),
          rotation: rotation,
          scale: new THREE.Vector3(1, 1, 1),
        },
        Collider: physicsWorld.createCollider(
          RAPIER.ColliderDesc.cuboid(
            size.x / 2,
            size.y / 2,
            size.z / 2
          ).setTranslation(
            position.x + offset.x * scale.x,
            position.y + offset.y * scale.y,
            position.z + offset.z * scale.z
          )
        ),
      });
    }
  });

  deleteRecursive(
    gltf.scene,
    (child) => child instanceof THREE.Mesh && child.userData.collider
  );

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      transparent: true,
      alphaTest: 0.5,
      map: assetsManager.getTexture("gun1/1.png"),
    })
  );

  // Add offset to the sprite
  sprite.geometry.translate(0, -0.435, 0);

  const player = gameManager.loadEntity({
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
      const sprite = gameManager.ecs.getComponent("Sprite", player)!;
      shooting = true;

      audioManager.play("shot.mp3");

      for (let i = 2; i <= 4; i++) {
        sprite.material.map = assetsManager.getTexture(`gun1/${i}.png`);
        await delay(100);
      }

      sprite.material.map = assetsManager.getTexture(`gun1/1.png`);
      shooting = false;
    }
  }, 20);

  gameManager.loadEntity({
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

  gameManager.loadEntity({
    AmbientLight: new THREE.AmbientLight(0xffffff, 1.5),
    Transform: {
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Quaternion(),
      scale: new THREE.Vector3(1, 1, 1),
    },
  });

  gameManager.ecs.addSystem(meshSystem);
  gameManager.ecs.addSystem(spriteSystem);
  gameManager.ecs.addSystem(playerControlSystem);
  gameManager.ecs.addSystem(lightSystem);
  gameManager.ecs.addSystem(aliasSystem);
  gameManager.ecs.addSystem(physicsSystem);

  const firstPersonCamera = new FirstPersonCameraControl(renderManager.camera, {
    distance: 1,
  });

  firstPersonCamera.follow(player);

  gameManager.start(() => {
    firstPersonCamera.update(gameManager.ecs.deltaTime, gameManager.ecs);
  });
}
