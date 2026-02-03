import { useMemo } from "react";
import { Color } from "three";
import { useAppState } from "../contexts/AppStateContext";
import {
  tonalityFragmentShader,
  tonalityVertexShader,
} from "../shaders/shader";
import linguisticConfig from "../config/linguisticConfig.json";

export const useTonalityMaterial = (color, languageCode) => {
  const { data } = useAppState();
  const linguisticProperties = data?.typologicalFeatures?.[languageCode];

  const colorObj = useMemo(() => new Color(color), [color]);

  const tonalityType = useMemo(() => {
    const tonality = linguisticProperties?.tonality;
    return (linguisticConfig.tonality.values[tonality]?.score ?? 1) - 1;
  }, [linguisticProperties?.tonality]);

  const material = useMemo(() => {
    return {
      uniforms: {
        uBaseColor: { value: colorObj },
        uTonalityType: { value: tonalityType },
      },
      vertexShader: tonalityVertexShader,
      fragmentShader: tonalityFragmentShader,
      side: 2,
      transparent: false,
    };
  }, [colorObj, tonalityType]);

  return material;
};
