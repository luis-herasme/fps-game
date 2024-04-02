import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";

export type Components = {
  Transform: {
    position: THREE.Vector3;
    rotation: THREE.Quaternion;
    scale: THREE.Vector3;
  };
  Mesh: THREE.Mesh;
  Sprite: THREE.Sprite;
  PlayerControl: {
    keys: {
      forward: string;
      backward: string;
      rotateLeft: string;
      rotateRight: string;
    };
    speed: number;
  };
  AmbientLight: THREE.AmbientLight;
  Alias: string;
  Collider: RAPIER.Collider;
  Shoot: {
    audio: string;
    shooting: boolean;
    shouldShoot: boolean;
    duration: number;
    bulletSeparation: number;
  };
  SpriteAnimation: {
    frames: string[];
    frameDuration: number;
    defaultFrame: string;
    active: boolean;
    shouldBeActive: boolean;
    sprite: THREE.Sprite;
  };
};
