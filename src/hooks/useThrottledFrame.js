import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import audioVisualizationConfig from "../config/audioVisualizationConfig.json";

const { timeRate } = audioVisualizationConfig.meshDeformation;

export const useThrottledFrame = (callback) => {
  const accRef = useRef(0);

  useFrame((state, delta) => {
    accRef.current += delta * 1000;
    if (accRef.current < timeRate) return;
    accRef.current -= timeRate;
    callback(state, delta);
  });
};
