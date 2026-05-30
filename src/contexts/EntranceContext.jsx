import { createContext, useContext, useEffect, useState } from "react";
import { getEntranceSteps } from "../i18n/runtime";
import { config } from "../modules/configStore";
import { useAppState } from "./AppStateContext";
import { useControls } from "./ControlsContext";

const {
  meshaRevealSequence,
  labelsRevealDelay,
  entranceDuration,
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

// Time the balloon shows before the next message replaces it
const calculateBalloonDisplayDuration = (message) =>
  durationBase + message.length * durationPerCharacter;

// Full duration including dismiss — used only after the last message
const calculateBalloonFullDuration = (message) =>
  calculateBalloonDisplayDuration(message) + durationDismiss;

const EntranceContext = createContext(null);

export const EntranceProvider = ({ children }) => {
  const { controls } = useControls();
  const { tension, friction } = controls;
  const { isSceneReady, setBalloonText } = useAppState();

  const allParts = meshaRevealSequence.map((s) => s.part);

  const [revealedParts, setRevealedParts] = useState(() => new Set());
  const [isMeshaSequenceDone, setIsMeshaSequenceDone] = useState(false);
  const [isEntranceComplete, setIsEntranceComplete] = useState(false);
  const [mentionedLanguage, setMentionedLanguage] = useState(null);

  // Reveals Mesha parts one by one according to meshaRevealSequence timings.
  // When the nose appears, triggers the balloon sequence in parallel.
  useEffect(() => {
    let cancelled = false;

    const runBalloonSequence = async () => {
      const steps = getEntranceSteps();
      for (let i = 0; i < steps.length; i++) {
        if (cancelled) return;
        const step = steps[i];
        const isLast = i === steps.length - 1;
        setBalloonText(step.message);
        setMentionedLanguage(step.language ?? null);
        // Between steps: wait only the display duration so the next message
        // replaces the balloon before dismiss plays. After the last step:
        // wait the full duration so the balloon finishes dismissing cleanly.
        await wait(
          isLast
            ? calculateBalloonFullDuration(step.message)
            : calculateBalloonDisplayDuration(step.message),
        );
      }
      if (!cancelled) {
        setBalloonText("");
        setMentionedLanguage(null);
      }
    };

    const runPartSequence = async () => {
      for (const { part, holdMs } of meshaRevealSequence) {
        if (cancelled) return;
        setRevealedParts((prev) => new Set([...prev, part]));
        if (part === "nose") {
          runBalloonSequence();
        }
        await wait(holdMs);
      }
      await wait(labelsRevealDelay);
      if (!cancelled) setIsMeshaSequenceDone(true);
    };

    runPartSequence();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isSceneReady || !isMeshaSequenceDone || isEntranceComplete) return;
    const timer = setTimeout(
      () => setIsEntranceComplete(true),
      entranceDuration,
    );
    return () => clearTimeout(timer);
  }, [isSceneReady, isEntranceComplete, isMeshaSequenceDone]);

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
        mentionedLanguage,
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
