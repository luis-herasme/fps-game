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
        const geometry = child.geometry.clone();
        geometry.applyMatrix4(child.matrix);
        geometry.computeVertexNormals();

        const vertices = new Float32Array(geometry.attributes.position.array);
        const indices = new Uint32Array(geometry.index.array);

        const colliderDescription = RAPIER.ColliderDesc.trimesh(
          vertices,
          indices
        );

        // Loading the entity with the new mesh and its world transformation
        entities.push({
          Mesh: new THREE.Mesh(
            child.geometry.clone().applyMatrix4(child.matrix),
            new THREE.MeshBasicMaterial({
              color: 0x00ff00,
              wireframe: true,
            })
          ),
          Transform: {
            position: new THREE.Vector3(),
            rotation: new THREE.Quaternion(),
            scale: new THREE.Vector3(1, 1, 1),
          },
          Collider: physicsWorld.createCollider(colliderDescription),
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
