import * as THREE from "three";
import { deleteRecursive } from "./utils/delete-recursive";
import { assetsManager } from "./core/assets-manager";
import { renderManager } from "./core/render-manager";
import { physicsWorld } from "./systems/physics/physics-world";
import RAPIER from "@dimforge/rapier3d-compat";
import { Components } from "./components";
import { EntityDefinition } from "./lib/ecs";

export class MapLoader {
  static async loadMap(
    gltfPath: string
  ): Promise<EntityDefinition<Components>[]> {
    const gltf = await assetsManager.loadGLTF(gltfPath);
    renderManager.scene.add(gltf.scene);

    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.alphaTest = 0.5;
        child.material.roughness = 1;
      }
    });

    const entities: EntityDefinition<Components>[] = [];

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

        const offset = child.geometry.boundingBox.getCenter(
          new THREE.Vector3()
        );

        // Creating a mesh with the geometry and a basic yellow wireframe material
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(size.x, size.y, size.z),
          new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true })
        );

        // Loading the entity with the new mesh and its world transformation
        entities.push({
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

    return entities;
  }
}
