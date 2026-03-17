import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

const SceneReadyGate = ({ hasDrawableScene, onSceneReady }) => {
  const visualReadyRef = useRef(false);

  useEffect(() => {
    if (!hasDrawableScene) {
      visualReadyRef.current = false;
      onSceneReady(false);
    }
  }, [hasDrawableScene, onSceneReady]);

  useFrame(() => {
    if (hasDrawableScene && !visualReadyRef.current) {
      visualReadyRef.current = true;
      onSceneReady(true);
    }
  });

  return null;
};

export default SceneReadyGate;
