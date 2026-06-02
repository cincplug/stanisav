import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { config } from "../modules/configStore";

const { timeRate } = config.meshaVisualization;

export const useThrottledFrame = (callback) => {
  const accRef = useRef(0);

  useFrame((state, delta) => {
    accRef.current += delta * 1000;
    if (accRef.current < timeRate) return;
    accRef.current -= timeRate;
    callback(state, delta);
  });
};
