import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useThrottledFrame } from "../../hooks/useThrottledFrame";

const SceneReadyGate = ({ hasDrawableScene, onSceneReady }) => {
  const visualReadyRef = useRef(false);

  useEffect(() => {
    if (!hasDrawableScene) {
      visualReadyRef.current = false;
      onSceneReady(false);
    }
  }, [hasDrawableScene, onSceneReady]);

  useThrottledFrame(() => {
    if (hasDrawableScene && !visualReadyRef.current) {
      visualReadyRef.current = true;
      onSceneReady(true);
    }
  });

  return null;
};

export default SceneReadyGate;
