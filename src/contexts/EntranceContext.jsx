import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getEntranceSteps } from "../i18n/runtime";
import { config } from "../modules/configStore";
import { useAppStateContext } from "./AppStateContext";
import { useControlsContext } from "./ControlsContext";

const {
  meshaRevealSequence,
  labelsRevealDelay,
  labelsEntranceDuration,
  labelRevealDuration,
  startRadiusFactor,
} = config.entrance;

const { durationBase, durationPerCharacter, durationDismiss } =
  config.speechBalloon;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toInnerStartPosition = ([x, y, z]) => [
  x * startRadiusFactor,
  y * startRadiusFactor,
  z * startRadiusFactor,
];

const calculateBalloonDisplayDuration = (message) =>
  durationBase + message.length * durationPerCharacter;

const calculateBalloonFullDuration = (message) =>
  calculateBalloonDisplayDuration(message) + durationDismiss;

const EntranceContext = createContext(null);

export const EntranceProvider = ({ children }) => {
  const { controls } = useControlsContext();
  const { tension, friction } = controls;
  const { isSceneReady } = useAppStateContext();

  const allParts = meshaRevealSequence.map((s) => s.part);
  const isSequenceCancelledRef = useRef(false);

  const [revealedParts, setRevealedParts] = useState(() => new Set());
  const [isMeshaSequenceDone, setIsMeshaSequenceDone] = useState(false);
  const [isLabelsSequenceDone, setIsLabelsSequenceDone] = useState(false);
  const [isBalloonSequenceDone, setIsBalloonSequenceDone] = useState(false);
  const [mentionedLanguage, setMentionedLanguage] = useState(null);
  const [entranceBalloonText, setEntranceBalloonText] = useState("");

  const isEntranceComplete = isLabelsSequenceDone && isBalloonSequenceDone;

  useEffect(() => {
    isSequenceCancelledRef.current = false;

    const runBalloonSequence = async () => {
      const steps = getEntranceSteps();
      for (let i = 0; i < steps.length; i++) {
        if (isSequenceCancelledRef.current) return;
        const step = steps[i];
        const isLast = i === steps.length - 1;
        setEntranceBalloonText(step.message);
        setMentionedLanguage(step.language ?? null);
        await wait(
          isLast
            ? calculateBalloonFullDuration(step.message)
            : calculateBalloonDisplayDuration(step.message),
        );
      }
      if (!isSequenceCancelledRef.current) {
        setEntranceBalloonText("");
        setMentionedLanguage(null);
        setIsBalloonSequenceDone(true);
      }
    };

    const runPartSequence = async () => {
      for (const { part, holdMs } of meshaRevealSequence) {
        if (isSequenceCancelledRef.current) return;
        setRevealedParts((prev) => new Set([...prev, part]));
        if (part === "nose") runBalloonSequence();
        await wait(holdMs);
      }
      await wait(labelsRevealDelay);
      if (!isSequenceCancelledRef.current) setIsMeshaSequenceDone(true);
    };

    runPartSequence();
    return () => {
      isSequenceCancelledRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (!isSceneReady || !isMeshaSequenceDone || isLabelsSequenceDone) return;
    const timer = setTimeout(
      () => setIsLabelsSequenceDone(true),
      labelsEntranceDuration,
    );
    return () => clearTimeout(timer);
  }, [isSceneReady, isLabelsSequenceDone, isMeshaSequenceDone]);

  const skipSequence = () => {
    isSequenceCancelledRef.current = true;
    setRevealedParts(new Set(allParts));
    setIsMeshaSequenceDone(true);
    setIsLabelsSequenceDone(true);
    setIsBalloonSequenceDone(true);
    setEntranceBalloonText("");
    setMentionedLanguage(null);
  };

  const getLabelSpringProps = (
    finalPosition,
    isSegmented,
    revealOrder,
    totalVisibleLabels,
  ) => {
    const staggerDelay = Math.round(
      (revealOrder / Math.max(1, totalVisibleLabels - 1)) *
        Math.max(0, labelsEntranceDuration - labelRevealDuration),
    );
    const delay =
      isEntranceComplete || isSegmented ? labelRevealDuration : staggerDelay;

    return {
      startPosition: toInnerStartPosition(finalPosition),
      finalPosition,
      delay,
      positionConfig: isEntranceComplete
        ? { tension, friction }
        : { duration: labelsEntranceDuration },
      revealConfig: { duration: labelRevealDuration },
    };
  };

  return (
    <EntranceContext.Provider
      value={{
        revealedParts,
        isMeshaSequenceDone,
        isLabelsSequenceDone,
        isBalloonSequenceDone,
        isEntranceComplete,
        mentionedLanguage,
        entranceBalloonText,
        setEntranceBalloonText,
        getLabelSpringProps,
        skipSequence,
        setIsLabelsSequenceDone,
      }}
    >
      {children}
    </EntranceContext.Provider>
  );
};

export const useEntranceContext = () => {
  const context = useContext(EntranceContext);
  if (!context)
    throw new Error("useEntrance must be used within an EntranceProvider");
  return context;
};
