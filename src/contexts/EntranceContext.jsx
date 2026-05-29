import { createContext, useContext, useEffect, useState } from "react";
import { useAppState } from "./AppStateContext";
import { useControls } from "./ControlsContext";
import { config } from "../modules/configStore";

const {
  meshaRevealSequence,
  labelsRevealDelay,
  entranceDuration,
  labelRevealDuration,
  startRadiusFactor,
} = config.entrance;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toInnerStartPosition = ([x, y, z]) => [
  x * startRadiusFactor,
  y * startRadiusFactor,
  z * startRadiusFactor,
];

const EntranceContext = createContext(null);

export const EntranceProvider = ({ children }) => {
  const { controls } = useControls();
  const { isMotionReduced, tension, friction } = controls;
  const { isSceneReady, setBalloonText } = useAppState();

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
        if (part === "nose") {
          setBalloonText("Hi, I'm Mesha");
        }
        setRevealedParts((prev) => new Set([...prev, part]));
        await wait(holdMs);
      }
      await wait(labelsRevealDelay);
      if (!cancelled) setIsMeshaSequenceDone(true);
      setBalloonText("This is my herd of languages");
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [isMotionReduced]);

  useEffect(() => {
    if (!isSceneReady || !isMeshaSequenceDone || isEntranceComplete) return;
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
        Math.max(0, entranceDuration - labelRevealDuration),
    );
    const delay =
      isEntranceComplete || isSegmented ? labelRevealDuration : staggerDelay;

    return {
      startPosition: toInnerStartPosition(finalPosition),
      finalPosition,
      delay,
      positionConfig: isEntranceComplete
        ? { tension, friction }
        : { duration: entranceDuration },
      revealConfig: { duration: labelRevealDuration },
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
