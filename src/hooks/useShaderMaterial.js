import { useMemo } from "react";
import { Color } from "three";
import {
  tonalityFragmentShader,
  tonalityVertexShader,
} from "../shaders/shader";

export const useShaderMaterial = (baseColor, accentColor, stripesType) => {
  const baseColorObj = useMemo(() => new Color(baseColor), [baseColor]);
  const accentColorObj = useMemo(() => new Color(accentColor), [accentColor]);

  const material = useMemo(() => {
    return {
      uniforms: {
        uBaseColor: { value: baseColorObj },
        uAccentColor: { value: accentColorObj },
        uStripesType: { value: stripesType },
      },
      vertexShader: tonalityVertexShader,
      fragmentShader: tonalityFragmentShader,
      side: 2,
      transparent: false,
    };
  }, [baseColorObj, accentColorObj, stripesType]);

  return material;
};
