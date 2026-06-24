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

export const EntranceProvider = ({ children }) => {
  const { config } = useConfigContext();

  const { entranceDuration, labelRevealDuration, startLabelOffset } =
    config.entrance;

  const { durationBase, durationPerLetter, durationDismiss } =
    config.speechBalloon;

  const { tension, friction } = config.motion;
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

  // Called by Mesha when all meshes have been revealed one by one
  const onMeshaSequenceDone = useCallback(() => {
    if (isSequenceCancelledRef.current) return;
    setIsMeshaSequenceDone(true);
    runBalloonSequence();
  }, []);

  useEffect(() => {
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
