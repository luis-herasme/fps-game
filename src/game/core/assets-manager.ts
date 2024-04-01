import * as THREE from "three";
import { TextureLoader } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type Assets = {
  gltfs?: string[];
  textures?: string[];
};

class AssetsManager {
  private loadingManager: THREE.LoadingManager;

  // Data
  private textures: Map<string, THREE.Texture> = new Map();
  private GLTFModels: Map<string, GLTF> = new Map();

  // Loaders
  private GLTFLoader: GLTFLoader;
  private textureLoader: TextureLoader;

  constructor() {
    this.loadingManager = new THREE.LoadingManager();
    this.GLTFLoader = new GLTFLoader(this.loadingManager);
    this.textureLoader = new TextureLoader(this.loadingManager);
  }

  public async load({ gltfs = [], textures = [] }: Assets) {
    const promises = [];

    for (const gltf of gltfs) {
      promises.push(this.loadGLTF(gltf));
    }

    for (const texture of textures) {
      promises.push(this.loadTexture(texture));
    }

    await Promise.all(promises);
  }

  getTexture(path: string): THREE.Texture {
    const texture = this.textures.get(path);

    if (texture === undefined) {
      throw new Error(`Texture ${path} not found`);
    }

    return texture;
  }

  getGLTF(path: string): GLTF {
    const model = this.GLTFModels.get(path);

    if (model === undefined) {
      throw new Error(`GLTF ${path} not found`);
    }

    return model;
  }

  private async loadTexture(path: string): Promise<THREE.Texture> {
    if (this.textures.has(path)) {
      return this.textures.get(path)!;
    }

    const texture = await this.textureLoader.loadAsync(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    this.textures.set(path, texture);
    return texture;
  }

  private async loadGLTF(url: string): Promise<GLTF> {
    const model = await this.GLTFLoader.loadAsync(url);
    this.GLTFModels.set(url, model);
    return model;
  }
}

export const assetsManager = new AssetsManager();
