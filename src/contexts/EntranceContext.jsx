import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getEntranceSteps } from "../i18n/runtime";
import { useAppStateContext } from "./AppStateContext";
import { useConfigContext } from "./ConfigContext";

const EntranceContext = createContext(null);

const entranceSteps = getEntranceSteps();

export const EntranceProvider = ({ children }) => {
  const { config } = useConfigContext();

  const {
    entranceDuration,
    labelRevealDuration,
    startLabelOffset,
    durationBase,
    durationPerLetter,
    durationDismiss,
    tension,
    friction,
  } = config;
  const { isSceneReady } = useAppStateContext();

  const isSequenceCancelledRef = useRef(false);

  const [isMeshaSequenceDone, setIsMeshaSequenceDone] = useState(false);
  const [isLabelsSequenceDone, setIsLabelsSequenceDone] = useState(false);
  const [isBalloonSequenceDone, setIsBalloonSequenceDone] = useState(false);
  const [mentionedLanguage, setMentionedLanguage] = useState(null);
  const [entranceBalloonText, setEntranceBalloonText] = useState("");

  const isEntranceComplete = isLabelsSequenceDone && isBalloonSequenceDone;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const toInnerStartPosition = ([x, y, z]) => [
    x * startLabelOffset,
    y * startLabelOffset,
    z * startLabelOffset,
  ];

  const calculateBalloonDisplayDuration = (message) =>
    durationBase + message.length * durationPerLetter;

  const calculateBalloonFullDuration = (message) =>
    calculateBalloonDisplayDuration(message) + durationDismiss;

  const runBalloonSequence = async () => {
    for (let i = 0; i < entranceSteps.length; i++) {
      if (isSequenceCancelledRef.current) return;
      const step = entranceSteps[i];
      const isLast = i === entranceSteps.length - 1;
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

  // Called by Mesha when all meshes have been revealed one by one
  const onMeshaSequenceDone = useCallback(() => {
    if (isSequenceCancelledRef.current) return;
    setIsMeshaSequenceDone(true);
    runBalloonSequence();
  }, []);

  useEffect(() => {
    if (entranceSteps.length === 0) return;
    setMentionedLanguage(entranceSteps[0].language);
    isSequenceCancelledRef.current = false;
    return () => {
      isSequenceCancelledRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (!isSceneReady || !isMeshaSequenceDone || isLabelsSequenceDone) return;
    const timer = setTimeout(
      () => setIsLabelsSequenceDone(true),
      entranceDuration,
    );
    return () => clearTimeout(timer);
  }, [isSceneReady, isLabelsSequenceDone, isMeshaSequenceDone]);

  const skipSequence = () => {
    isSequenceCancelledRef.current = true;
    setIsMeshaSequenceDone(true);
    setIsLabelsSequenceDone(true);
    setIsBalloonSequenceDone(true);
    setEntranceBalloonText("");
    setMentionedLanguage(null);
  };

  const getLabelSpringProps = (
    finalPosition,
    isBlackboard,
    revealOrder,
    totalVisibleLabels,
  ) => {
    const staggerDelay = Math.round(
      (revealOrder / Math.max(1, totalVisibleLabels - 1)) *
        Math.max(0, entranceDuration - labelRevealDuration),
    );
    const delay =
      isEntranceComplete || isBlackboard ? labelRevealDuration : staggerDelay;

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
        entranceSteps,
        isMeshaSequenceDone,
        isLabelsSequenceDone,
        isBalloonSequenceDone,
        isEntranceComplete,
        mentionedLanguage,
        entranceBalloonText,
        setEntranceBalloonText,
        getLabelSpringProps,
        onMeshaSequenceDone,
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
