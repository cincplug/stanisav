import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import linguisticConfig from "../config/linguisticConfig.json";

function getAllBadgeTextureFiles() {
  const wordOrders = Object.keys(linguisticConfig.wordOrder.values);
  const morphologies = Object.keys(linguisticConfig.morphology.values);

  const wordOrderFiles = wordOrders.map(
    (wo) => `/textures/${wo.toLowerCase()}.png`,
  );
  const morphologyFiles = morphologies.map(
    (m) => `/textures/${m.toLowerCase()}.png`,
  );

  return Array.from(new Set([...wordOrderFiles, ...morphologyFiles]));
}

export function usePreloadBadgeTextures() {
  const files = getAllBadgeTextureFiles();

  useLoader(TextureLoader, files);
}
