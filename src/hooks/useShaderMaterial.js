import { useMemo, useRef } from "react";
import { Color } from "three";
import { useFrame } from "@react-three/fiber";
import {
  meshVertexShader,
  tonalityFragmentShader,
  highlightFragmentShader,
} from "../shaders/shader";
import sceneConfig from "../config/sceneConfig.json";
import { useThrottledFrame } from "./useThrottledFrame";

const {
  shaderAmbient,
  shaderLightingMin,
  shaderLightingMax,
  shaderLightingDiffuseScale,
  shaderShadeChecker,
  shaderShadeStripe,
  shaderCheckerFrequency,
  shaderRingCount,
  shaderRingSpeed,
  currentColor,
} = sceneConfig;

// ─── Tonality / skin material ─────────────────────────────────────────────────

export const useShaderMaterial = (
  baseColor,
  accentColor,
  stripesType,
  side = 2,
) => {
  const baseColorObj = useMemo(() => new Color(baseColor), [baseColor]);
  const accentColorObj = useMemo(() => new Color(accentColor), [accentColor]);

  const material = useMemo(
    () => ({
      uniforms: {
        uBaseColor: { value: baseColorObj },
        uAccentColor: { value: accentColorObj },
        uStripesType: { value: stripesType },
        uAccentOpacity: { value: 1.0 },
        uAmbient: { value: shaderAmbient },
        uLightingMin: { value: shaderLightingMin },
        uLightingMax: { value: shaderLightingMax },
        uLightingDiffuseScale: { value: shaderLightingDiffuseScale },
        uShadeChecker: { value: shaderShadeChecker },
        uShadeStripe: { value: shaderShadeStripe },
        uCheckerFrequency: { value: shaderCheckerFrequency },
      },
      vertexShader: meshVertexShader,
      fragmentShader: tonalityFragmentShader,
      side,
      transparent: false,
    }),
    [baseColorObj, accentColorObj, stripesType],
  );

  return material;
};

// ─── Highlight material ───────────────────────────────────────────────────────
// Concentric expanding rings in currentColor. Pass stripesType so tongue/ears
// keep their tonality stripes visible on top of the highlight pattern.

export const useHighlightMaterial = (stripesType = 0, side = 2) => {
  const ringColor = useMemo(() => new Color(currentColor), []);
  // Mild shade: darken by shaderShadeChecker factor (reuse same scale as checker)
  const ringColorShade = useMemo(
    () =>
      new Color(currentColor).multiplyScalar(
        (shaderShadeChecker + shaderShadeStripe) / 2,
      ),
    [],
  );

  const material = useMemo(
    () => ({
      uniforms: {
        uRingColor: { value: ringColor },
        uRingColorShade: { value: ringColorShade },
        uStripesType: { value: stripesType },
        uTime: { value: 0 },
        uAmbient: { value: shaderAmbient },
        uLightingMin: { value: shaderLightingMin },
        uLightingMax: { value: shaderLightingMax },
        uLightingDiffuseScale: { value: shaderLightingDiffuseScale },
        uShadeStripe: { value: shaderShadeStripe },
        uRingCount: { value: shaderRingCount },
        uRingSpeed: { value: shaderRingSpeed },
      },
      vertexShader: meshVertexShader,
      fragmentShader: highlightFragmentShader,
      side,
      transparent: false,
    }),
    [stripesType],
  );

  // Update uTime each frame so rings animate
  useThrottledFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
  });

  return material;
};
