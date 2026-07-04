import { useEffect, useRef } from "react";
import { useAppStateContext } from "../../contexts/AppStateContext";
import { useThrottledFrame } from "../../hooks/useThrottledFrame";

const SceneReadyGate = ({ hasDrawableScene }) => {
  const visualReadyRef = useRef(false);
  const { setIsSceneReady } = useAppStateContext();

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
