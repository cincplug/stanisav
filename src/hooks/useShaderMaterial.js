import { useMemo } from "react";
import { Color } from "three";
import { config } from "../modules/configStore";
import {
  highlightFragmentShader,
  meshVertexShader,
  tonalityFragmentShader,
} from "../shaders/shader";
import { useThrottledFrame } from "./useThrottledFrame";

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
        uAmbient: { value: config.shader.shaderAmbient },
        uLightingMin: { value: config.shader.shaderLightingMin },
        uLightingMax: { value: config.shader.shaderLightingMax },
        uLightingDiffuseScale: { value: config.shader.shaderLightingDiffuse },
        uShadeChecker: { value: config.shader.shaderShadeChecker },
        uShadeStripe: { value: config.shader.shaderShadeStripe },
        uCheckerFrequency: { value: config.shader.shaderCheckerFrequency },
      },
      vertexShader: meshVertexShader,
      fragmentShader: tonalityFragmentShader,
      side,
      transparent: false,
    }),
    [baseColorObj, accentColorObj, stripesType],
  );

  // Sync shader uniforms from config each frame so advanced control edits reflect live
  useThrottledFrame(() => {
    material.uniforms.uAmbient.value = config.shader.shaderAmbient;
    material.uniforms.uLightingMin.value = config.shader.shaderLightingMin;
    material.uniforms.uLightingMax.value = config.shader.shaderLightingMax;
    material.uniforms.uLightingDiffuseScale.value = config.shader.shaderLightingDiffuse;
    material.uniforms.uShadeChecker.value = config.shader.shaderShadeChecker;
    material.uniforms.uShadeStripe.value = config.shader.shaderShadeStripe;
    material.uniforms.uCheckerFrequency.value = config.shader.shaderCheckerFrequency;
  });

  return material;
};

// ─── Highlight material ───────────────────────────────────────────────────────

export const useHighlightMaterial = (stripesType = 0, side = 2) => {
  const ringColor = useMemo(() => new Color(config.colors.currentColor), []);
  const ringColorShade = useMemo(
    () =>
      new Color(config.colors.currentColor).multiplyScalar(
        (config.shader.shaderShadeChecker + config.shader.shaderShadeStripe) / 2,
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
        uAmbient: { value: config.shader.shaderAmbient },
        uLightingMin: { value: config.shader.shaderLightingMin },
        uLightingMax: { value: config.shader.shaderLightingMax },
        uLightingDiffuseScale: { value: config.shader.shaderLightingDiffuse },
        uShadeStripe: { value: config.shader.shaderShadeStripe },
        uRingCount: { value: config.shader.shaderRingCount },
        uRingSpeed: { value: config.shader.shaderRingSpeed },
      },
      vertexShader: meshVertexShader,
      fragmentShader: highlightFragmentShader,
      side,
      transparent: false,
    }),
    [stripesType],
  );

  // Sync uTime for ring animation and shader uniforms from config for live advanced edits
  useThrottledFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
    material.uniforms.uAmbient.value = config.shader.shaderAmbient;
    material.uniforms.uLightingMin.value = config.shader.shaderLightingMin;
    material.uniforms.uLightingMax.value = config.shader.shaderLightingMax;
    material.uniforms.uLightingDiffuseScale.value = config.shader.shaderLightingDiffuse;
    material.uniforms.uShadeStripe.value = config.shader.shaderShadeStripe;
    material.uniforms.uRingCount.value = config.shader.shaderRingCount;
    material.uniforms.uRingSpeed.value = config.shader.shaderRingSpeed;
  });

  return material;
};