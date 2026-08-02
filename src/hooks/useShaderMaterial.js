import { useMemo } from "react";
import { Color } from "three";
import { useConfigContext } from "../contexts/ConfigContext";
import { meshVertexShader, tonalityFragmentShader } from "../shaders/shader";
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
    shaderOpacity,
  } = config;

  const baseColorObj = useMemo(() => new Color(baseColor), [baseColor]);
  const accentColorObj = useMemo(() => new Color(accentColor), [accentColor]);

  const material = useMemo(
    () => ({
      uniforms: {
        uBaseColor: { value: baseColorObj },
        uAccentColor: { value: accentColorObj },
        uStripesType: { value: stripesType },
        uAccentOpacity: { value: 1.0 },
        uOpacity: { value: shaderOpacity },
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
      transparent: shaderOpacity < 1,
      depthWrite: false,
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
      shaderOpacity,
    } = config;

    material.uniforms.uAmbient.value = ambient;
    material.uniforms.uLightingMin.value = lightingMin;
    material.uniforms.uLightingMax.value = lightingMax;
    material.uniforms.uLightingDiffuse.value = lightingDiffuse;
    material.uniforms.uOpacity.value = shaderOpacity;
    material.uniforms.uShadeChecker.value = shadeChecker;
    material.uniforms.uShadeStripe.value = shadeStripe;
  });

  return material;
};
