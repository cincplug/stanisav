import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { computeOpacities } from "../utils/sceneUtils";

const OCCLUSION_FADE_NEAR = 10;
const OCCLUSION_FADE_FAR = 25;

// Computes and exposes per-language opacities for a set of positions,
// updating every frame so occlusion tracks camera movement in real time.
export const useClusterOpacities = (
  camera,
  formattedPositions,
  selectedLanguage,
) => {
  const [opacities, setOpacities] = useState(() =>
    computeOpacities(
      camera,
      formattedPositions,
      selectedLanguage,
      OCCLUSION_FADE_NEAR,
      OCCLUSION_FADE_FAR,
    ),
  );
  const prevOpacitiesRef = useRef(opacities);

  useFrame(() => {
    const next = computeOpacities(
      camera,
      formattedPositions,
      selectedLanguage,
      OCCLUSION_FADE_NEAR,
      OCCLUSION_FADE_FAR,
    );
    const prev = prevOpacitiesRef.current;
    const hasChanged = Object.keys(next).some(
      (code) => Math.abs((next[code] ?? 1) - (prev[code] ?? 1)) > 0.01,
    );
    if (hasChanged) {
      prevOpacitiesRef.current = next;
      setOpacities(next);
    }
  });

  return opacities;
};
