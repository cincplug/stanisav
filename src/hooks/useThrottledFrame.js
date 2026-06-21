import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useConfigContext } from "../contexts/ConfigContext";

export const useThrottledFrame = (callback) => {
  const accRef = useRef(0);
  const { config } = useConfigContext();
  const { timeRate } = config.meshaVisualization;

  useFrame((state, delta) => {
    accRef.current += delta * 1000;
    if (accRef.current < timeRate) return;
    accRef.current -= timeRate;
    callback(state, delta);
  });
};
