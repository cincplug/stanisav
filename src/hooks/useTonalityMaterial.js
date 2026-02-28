import { useMemo } from "react";
import { Color } from "three";
import {
  tonalityFragmentShader,
  tonalityVertexShader,
} from "../shaders/shader";

export const useTonalityMaterial = (baseColor, accentColor, tonalityType) => {
  const baseColorObj = useMemo(() => new Color(baseColor), [baseColor]);
  const accentColorObj = useMemo(() => new Color(accentColor), [accentColor]);

  const material = useMemo(() => {
    return {
      uniforms: {
        uBaseColor: { value: baseColorObj },
        uAccentColor: { value: accentColorObj },
        uTonalityType: { value: tonalityType },
      },
      vertexShader: tonalityVertexShader,
      fragmentShader: tonalityFragmentShader,
      side: 2,
      transparent: false,
    };
  }, [baseColorObj, accentColorObj, tonalityType]);

  return material;
};
