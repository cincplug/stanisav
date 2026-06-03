import { useMemo } from "react";
import { Color } from "three";
import { config } from "../modules/configStore";
import {
  highlightFragmentShader,
  meshVertexShader,
  tonalityFragmentShader,
} from "../shaders/shader";
import { useThrottledFrame } from "./useThrottledFrame";

export const useShaderMaterial = (
  baseColor,
  accentColor,
  stripesType,
  side = 2,
) => {
  const {
    shaderAmbient,
    shaderLightingMin,
    shaderLightingMax,
    shaderLightingDiffuse,
    shaderShadeChecker,
    shaderShadeStripe,
    shaderCheckerFrequency,
  } = config.shader;

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
        uLightingDiffuseScale: { value: shaderLightingDiffuse },
        uShadeChecker: { value: shaderShadeChecker },
        uShadeStripe: { value: shaderShadeStripe },
        uCheckerFrequency: { value: shaderCheckerFrequency },
      },
      vertexShader: meshVertexShader,
      fragmentShader: tonalityFragmentShader,
      side,
      transparent: false,
    }),
    [
      baseColorObj,
      accentColorObj,
      stripesType,
      shaderAmbient,
      shaderLightingMin,
      shaderLightingMax,
      shaderLightingDiffuse,
      shaderShadeChecker,
      shaderShadeStripe,
      shaderCheckerFrequency,
    ],
  );

  useThrottledFrame(() => {
    const {
      shaderAmbient,
      shaderLightingMin,
      shaderLightingMax,
      shaderLightingDiffuse,
      shaderShadeChecker,
      shaderShadeStripe,
      shaderCheckerFrequency,
    } = config.shader;

    material.uniforms.uAmbient.value = shaderAmbient;
    material.uniforms.uLightingMin.value = shaderLightingMin;
    material.uniforms.uLightingMax.value = shaderLightingMax;
    material.uniforms.uLightingDiffuseScale.value = shaderLightingDiffuse;
    material.uniforms.uShadeChecker.value = shaderShadeChecker;
    material.uniforms.uShadeStripe.value = shaderShadeStripe;
    material.uniforms.uCheckerFrequency.value = shaderCheckerFrequency;
  });

  return material;
};

export const useHighlightMaterial = (stripesType = 0, side = 2) => {
  const {
    shaderAmbient,
    shaderLightingMin,
    shaderLightingMax,
    shaderLightingDiffuse,
    shaderShadeChecker,
    shaderShadeStripe,
    shaderRingCount,
    shaderRingSpeed,
  } = config.shader;

  const ringColor = useMemo(() => new Color(config.colors.currentColor), []);
  const ringColorShade = useMemo(
    () =>
      new Color(config.colors.currentColor).multiplyScalar(
        (shaderShadeChecker + shaderShadeStripe) / 2,
      ),
    [shaderShadeChecker, shaderShadeStripe],
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
        uLightingDiffuseScale: { value: shaderLightingDiffuse },
        uShadeStripe: { value: shaderShadeStripe },
        uRingCount: { value: shaderRingCount },
        uRingSpeed: { value: shaderRingSpeed },
      },
      vertexShader: meshVertexShader,
      fragmentShader: highlightFragmentShader,
      side,
      transparent: false,
    }),
    [
      stripesType,
      ringColor,
      ringColorShade,
      shaderAmbient,
      shaderLightingMin,
      shaderLightingMax,
      shaderLightingDiffuse,
      shaderShadeStripe,
      shaderRingCount,
      shaderRingSpeed,
    ],
  );

  useThrottledFrame(({ clock }) => {
    const {
      shaderAmbient,
      shaderLightingMin,
      shaderLightingMax,
      shaderLightingDiffuse,
      shaderShadeStripe,
      shaderRingCount,
      shaderRingSpeed,
    } = config.shader;

    material.uniforms.uTime.value = clock.getElapsedTime();
    material.uniforms.uAmbient.value = shaderAmbient;
    material.uniforms.uLightingMin.value = shaderLightingMin;
    material.uniforms.uLightingMax.value = shaderLightingMax;
    material.uniforms.uLightingDiffuseScale.value = shaderLightingDiffuse;
    material.uniforms.uShadeStripe.value = shaderShadeStripe;
    material.uniforms.uRingCount.value = shaderRingCount;
    material.uniforms.uRingSpeed.value = shaderRingSpeed;
  });

  return material;
};
