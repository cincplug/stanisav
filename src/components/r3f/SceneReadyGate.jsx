import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useThrottledFrame } from "../../hooks/useThrottledFrame";
import { useAppState } from "../../contexts/AppStateContext";

const SceneReadyGate = ({ hasDrawableScene }) => {
  const visualReadyRef = useRef(false);
  const { setIsSceneReady } = useAppState();

  useEffect(() => {
    if (!hasDrawableScene) {
      visualReadyRef.current = false;
      setIsSceneReady(false);
    }
  }, [hasDrawableScene]);

  useThrottledFrame(() => {
    if (hasDrawableScene && !visualReadyRef.current) {
      visualReadyRef.current = true;
      setIsSceneReady(true);
    }
  });

  return null;
};

export default SceneReadyGate;
