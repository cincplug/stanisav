import { useMemo } from "react";
import { Color } from "three";
import { useAppState } from "../contexts/AppStateContext";
import {
  tonalityFragmentShader,
  tonalityVertexShader,
} from "../shaders/shader";
import linguisticConfig from "../config/linguisticConfig.json";

export const useTonalityMaterial = (
  baseColor,
  accentColor = baseColor,
  languageCode,
) => {
  const { data } = useAppState();
  const linguisticProperties = data?.typologicalFeatures?.[languageCode];

  const baseColorObj = useMemo(() => new Color(baseColor), [baseColor]);
  const accentColorObj = useMemo(() => new Color(accentColor), [accentColor]);

  const tonalityType = useMemo(() => {
    const tonality = linguisticProperties?.tonality;
    return (linguisticConfig.tonality.values[tonality]?.score ?? 1) - 1;
  }, [linguisticProperties?.tonality]);

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
