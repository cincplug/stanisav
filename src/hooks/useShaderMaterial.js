import { useMemo } from "react";
import { Color } from "three";
import { useConfigContext } from "../contexts/ConfigContext";
import {
  highlightFragmentShader,
  meshVertexShader,
  tonalityFragmentShader,
} from "../shaders/shader";
import { useThrottledFrame } from "./useThrottledFrame";

export const useShaderMaterial = (baseColor, accentColor, stripesType) => {
  const { config } = useConfigContext();
  const {
    ambient,
    lightingMin,
    lightingMax,
    lightingDiffuse,
    shadeChecker,
    shadeStripe,
    opacity,
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
        uOpacity: { value: opacity },
        uAmbient: { value: ambient },
        uLightingMin: { value: lightingMin },
        uLightingMax: { value: lightingMax },
        uLightingDiffuse: { value: lightingDiffuse },
        uShadeChecker: { value: shadeChecker },
        uShadeStripe: { value: shadeStripe },
      },
      vertexShader: meshVertexShader,
      fragmentShader: tonalityFragmentShader,
      side: 2,
      transparent: opacity < 1,
    }),
    [
      baseColorObj,
      accentColorObj,
      stripesType,
      ambient,
      lightingMin,
      lightingMax,
      lightingDiffuse,
      shadeChecker,
      shadeStripe,
    ],
  );

  useThrottledFrame(() => {
    const {
      ambient,
      lightingMin,
      lightingMax,
      lightingDiffuse,
      shadeChecker,
      shadeStripe,
      opacity,
    } = config.shader;

    material.uniforms.uAmbient.value = ambient;
    material.uniforms.uLightingMin.value = lightingMin;
    material.uniforms.uLightingMax.value = lightingMax;
    material.uniforms.uLightingDiffuse.value = lightingDiffuse;
    material.uniforms.uOpacity.value = opacity;
    material.uniforms.uShadeChecker.value = shadeChecker;
    material.uniforms.uShadeStripe.value = shadeStripe;
  });

  return material;
};

export const useHighlightMaterial = (stripesType = 0) => {
  const { config } = useConfigContext();
  const {
    ambient,
    lightingMin,
    lightingMax,
    lightingDiffuse,
    opacity,
    shadeChecker,
    shadeStripe,
    ringCount,
    ringSpeed,
  } = config.shader;

  const ringColor = useMemo(() => new Color(config.colors.currentColor), []);
  const ringColorShade = useMemo(
    () =>
      new Color(config.colors.currentColor).multiplyScalar(
        (shadeChecker + shadeStripe) / 2,
      ),
    [shadeChecker, shadeStripe],
  );

  const material = useMemo(
    () => ({
      uniforms: {
        uRingColor: { value: ringColor },
        uRingColorShade: { value: ringColorShade },
        uStripesType: { value: stripesType },
        uTime: { value: 0 },
        uOpacity: { value: opacity },
        uAmbient: { value: ambient },
        uLightingMin: { value: lightingMin },
        uLightingMax: { value: lightingMax },
        uLightingDiffuse: { value: lightingDiffuse },
        uShadeStripe: { value: shadeStripe },
        uRingCount: { value: ringCount },
        uRingSpeed: { value: ringSpeed },
      },
      vertexShader: meshVertexShader,
      fragmentShader: highlightFragmentShader,
      side: 2,
      transparent: opacity < 1,
    }),
    [
      stripesType,
      opacity,
      ringColor,
      ringColorShade,
      ambient,
      lightingMin,
      lightingMax,
      lightingDiffuse,
      shadeStripe,
      ringCount,
      ringSpeed,
    ],
  );

  useThrottledFrame(({ clock }) => {
    const {
      ambient,
      lightingMin,
      lightingMax,
      lightingDiffuse,
      shadeStripe,
      opacity,
      ringCount,
      ringSpeed,
    } = config.shader;

    material.uniforms.uTime.value = clock.getElapsedTime();
    material.uniforms.uAmbient.value = ambient;
    material.uniforms.uLightingMin.value = lightingMin;
    material.uniforms.uLightingMax.value = lightingMax;
    material.uniforms.uLightingDiffuse.value = lightingDiffuse;
    material.uniforms.uOpacity.value = opacity;
    material.uniforms.uShadeStripe.value = shadeStripe;
    material.uniforms.uRingCount.value = ringCount;
    material.uniforms.uRingSpeed.value = ringSpeed;
  });

  return material;
};
