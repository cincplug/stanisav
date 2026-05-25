import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSpring } from "@react-spring/three";
import { useAppState } from "./AppStateContext";
import { useControls } from "./ControlsContext";
import sceneConfig from "../config/sceneConfig.json";

const {
  meshaRevealSequence,
  postMeshaDelayMs,
  entranceDuration,
  revealDuration,
  startRadiusFactor,
} = sceneConfig;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toInnerStartPosition = ([x, y, z]) => [
  x * startRadiusFactor,
  y * startRadiusFactor,
  z * startRadiusFactor,
];

const EntranceContext = createContext(null);

export const EntranceProvider = ({ children }) => {
  const { controls } = useControls();
  const { isMotionReduced } = controls;
  const { isSceneReady } = useAppState();

  const allParts = meshaRevealSequence.map((s) => s.part);

  const [revealedParts, setRevealedParts] = useState(
    () => new Set(isMotionReduced ? allParts : []),
  );
  const [isMeshaSequenceDone, setIsMeshaSequenceDone] =
    useState(isMotionReduced);
  const [isEntranceComplete, setIsEntranceComplete] = useState(false);

  // Mesha part sequence
  useEffect(() => {
    if (isMotionReduced) return;
    let cancelled = false;

    const run = async () => {
      for (const { part, holdMs } of meshaRevealSequence) {
        if (cancelled) return;
        setRevealedParts((prev) => new Set([...prev, part]));
        await wait(holdMs);
      }
      await wait(postMeshaDelayMs);
      if (!cancelled) setIsMeshaSequenceDone(true);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [isMotionReduced]);

  // Labels entrance — fires once Mesha sequence is done and scene is ready
  useEffect(() => {
    if (!isSceneReady || isEntranceComplete) return;
    if (!isMeshaSequenceDone) return;
    const delay = isMotionReduced ? 0 : revealDuration;
    const timer = setTimeout(
      () => setIsEntranceComplete(true),
      isMotionReduced ? 0 : entranceDuration,
    );
    return () => clearTimeout(timer);
  }, [isSceneReady, isEntranceComplete, isMeshaSequenceDone, isMotionReduced]);

  const skipSequence = () => {
    setRevealedParts(new Set(allParts));
    setIsMeshaSequenceDone(true);
  };

  const getLabelSpringProps = (
    finalPosition,
    isSegmented,
    revealOrder,
    totalVisibleLabels,
  ) => {
    const staggerDelay = Math.round(
      (revealOrder / Math.max(1, totalVisibleLabels - 1)) *
        Math.max(0, entranceDuration - revealDuration),
    );
    const delay =
      isEntranceComplete || isSegmented ? revealDuration : staggerDelay;

    return {
      startPosition: toInnerStartPosition(finalPosition),
      finalPosition,
      delay,
      positionConfig: { duration: entranceDuration },
      revealConfig: { duration: revealDuration },
    };
  };

  return (
    <EntranceContext.Provider
      value={{
        revealedParts,
        isMeshaSequenceDone,
        isEntranceComplete,
        getLabelSpringProps,
        skipSequence,
        setIsEntranceComplete,
      }}
    >
      {children}
    </EntranceContext.Provider>
  );
};

export const useEntrance = () => {
  const context = useContext(EntranceContext);
  if (!context)
    throw new Error("useEntrance must be used within an EntranceProvider");
  return context;
};
