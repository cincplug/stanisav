import { useMemo } from "react";
import { Color } from "three";
import { useConfigContext } from "../contexts/ConfigContext";
import { meshVertexShader, tonalityFragmentShader } from "../shaders/shader";
import { useThrottledFrame } from "./useThrottledFrame";

export const useShaderMaterial = (baseColor, accentColor, stripesType) => {
  const { config } = useConfigContext();
  const { shaderLight, shaderBase, shaderStripe, shaderOpacity } = config;

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
        uShaderLight: { value: shaderLight },
        uShaderBase: { value: shaderBase },
        uShaderStripe: { value: shaderStripe },
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
      shaderLight,
      shaderBase,
      shaderStripe,
    ],
  );

  useThrottledFrame(() => {
    const { shaderLight, shaderBase, shaderStripe, shaderOpacity } = config;

    material.uniforms.uShaderLight.value = shaderLight;
    material.uniforms.uOpacity.value = shaderOpacity;
    material.uniforms.uShaderBase.value = shaderBase;
    material.uniforms.uShaderStripe.value = shaderStripe;
  });

  return material;
};
