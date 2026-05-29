import { useEffect, useRef } from "react";
import { useAppState } from "../../contexts/AppStateContext";
import { useThrottledFrame } from "../../hooks/useThrottledFrame";

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
