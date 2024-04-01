import * as THREE from "three";

export function deleteRecursive(
  scene: THREE.Group,
  check: (child: THREE.Object3D) => boolean
) {
  for (let i = scene.children.length - 1; i >= 0; i--) {
    const child = scene.children[i];

    if (check(child)) {
      scene.remove(child);
    } else if (child instanceof THREE.Group) {
      deleteRecursive(child, check);
    }
  }
}
