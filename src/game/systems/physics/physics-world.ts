import RAPIER from "@dimforge/rapier3d-compat";

await RAPIER.init();

export const physicsWorld = new RAPIER.World(
  new RAPIER.Vector3(0.0, -9.81, 0.0)
);
