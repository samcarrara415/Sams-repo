import type { MapSpec, ModelSpec, PartSpec, SkyboxSpec, Rgb } from "./rbxlx.js";

export interface GeneratedImage {
  id: string; // logical id, e.g. "skybox_up", "sign_welcome_decal"
  prompt: string;
  filepath: string;
}

export class MapState {
  parts: PartSpec[] = [];
  models: ModelSpec[] = [];
  skybox?: SkyboxSpec;
  ambient?: Rgb;
  images: GeneratedImage[] = [];
  finalized = false;

  toSpec(): MapSpec {
    return {
      parts: this.parts,
      models: this.models,
      skybox: this.skybox,
      ambient: this.ambient,
    };
  }
}
