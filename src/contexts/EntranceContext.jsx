import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getEntranceSteps } from "../i18n/runtime";
import { useI18nContext } from "./I18nContext";
import linguisticConfig from "../config/linguisticConfig.json";
import entranceShowcaseConfig from "../config/entranceShowcaseConfig.json";
import {
  extractPropertyOverrides,
  hasPropertyOverrides,
} from "../utils/entranceUtils";
import { useConfigContext } from "./ConfigContext";

const EntranceContext = createContext(null);
const stanisavShapePropertyNames = Object.keys(linguisticConfig);
const { introStepCount, showcaseStepDuration, showcaseSteps } =
  entranceShowcaseConfig;

export const EntranceProvider = ({ children }) => {
  const { config } = useConfigContext();
  const { isLocaleReady } = useI18nContext();

  const entranceSteps = isLocaleReady ? getEntranceSteps() : [];

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

  const isSequenceCancelledRef = useRef(false);

  const [isStanisavSequenceDone, setIsStanisavSequenceDone] = useState(false);
  const [isLabelsSequenceDone, setIsLabelsSequenceDone] = useState(false);
  const [isBalloonSequenceDone, setIsBalloonSequenceDone] = useState(false);
  const [isShowcaseSequenceDone, setIsShowcaseSequenceDone] = useState(false);
  const [mentionedLanguage, setMentionedLanguage] = useState(null);
  const [mentionedPropertyOverrides, setMentionedPropertyOverrides] = useState(
    {},
  );
  const [entranceBalloonText, setEntranceBalloonText] = useState("");

  const isEntranceComplete =
    isLabelsSequenceDone && isBalloonSequenceDone && isShowcaseSequenceDone;

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

  // Only the first few i18n entrance messages actually play — this keeps the
  // spoken intro short so the label reveal and shape showcase (below) can
  // start promptly instead of waiting on however many messages exist.
  const introSteps = entranceSteps.slice(0, introStepCount);

  const runBalloonSequence = async () => {
    for (let i = 0; i < introSteps.length; i++) {
      if (isSequenceCancelledRef.current) return;
      const step = introSteps[i];
      const isLast = i === introSteps.length - 1;

      const propertyOverrides = extractPropertyOverrides(
        step,
        stanisavShapePropertyNames,
      );
      const isNewShapeMentioned =
        Boolean(step.language) || hasPropertyOverrides(propertyOverrides);

      // A step with neither a language nor loose properties leaves
      // Stanisav in whatever shape the previous step left him.
      if (isNewShapeMentioned) {
        if (step.language) setMentionedLanguage(step.language);
        setMentionedPropertyOverrides(propertyOverrides);
      }

      setEntranceBalloonText(step.message);
      await wait(
        isLast
          ? calculateBalloonFullDuration(step.message)
          : calculateBalloonDisplayDuration(step.message),
      );
    }
    if (!isSequenceCancelledRef.current) {
      setEntranceBalloonText("");
      setMentionedLanguage(null);
      setMentionedPropertyOverrides({});
      setIsBalloonSequenceDone(true);
      // Fire-and-forget: runs alongside the label reveal, not blocking it.
      runShowcaseSequence();
    }
  };

  // Purely visual, text-free follow-up to the spoken intro: cycles Stanisav
  // through a config-driven sequence of shape-property waypoints so the
  // "he can look like any language" idea reads clearly without needing any
  // translated text. One-timer, same cadence idea as onStanisavSequenceDone's
  // mesh-reveal assembly.
  const runShowcaseSequence = async () => {
    for (const step of showcaseSteps) {
      if (isSequenceCancelledRef.current) return;
      setMentionedPropertyOverrides(
        extractPropertyOverrides(step, stanisavShapePropertyNames),
      );
      await wait(showcaseStepDuration);
    }
    if (!isSequenceCancelledRef.current) {
      setMentionedPropertyOverrides({});
      setIsShowcaseSequenceDone(true);
    }
  };

  // Called by Stanisav when all meshes have been revealed one by one
  const onStanisavSequenceDone = useCallback(() => {
    if (isSequenceCancelledRef.current) return;
    setIsStanisavSequenceDone(true);
    runBalloonSequence();
  }, [runBalloonSequence]);

  useEffect(() => {
    if (entranceSteps.length === 0) return;
    const firstStep = entranceSteps[0];
    setMentionedLanguage(firstStep.language);
    setMentionedPropertyOverrides(
      extractPropertyOverrides(firstStep, stanisavShapePropertyNames),
    );
    isSequenceCancelledRef.current = false;
    return () => {
      isSequenceCancelledRef.current = true;
    };
  }, []);

  const skipSequence = () => {
    isSequenceCancelledRef.current = true;
    setIsStanisavSequenceDone(true);
    setIsLabelsSequenceDone(true);
    setIsBalloonSequenceDone(true);
    setIsShowcaseSequenceDone(true);
    setEntranceBalloonText("");
    setMentionedLanguage(null);
    setMentionedPropertyOverrides({});
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
    const delay = isEntranceComplete ? labelRevealDuration : staggerDelay;

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
        isStanisavSequenceDone,
        isLabelsSequenceDone,
        isBalloonSequenceDone,
        isShowcaseSequenceDone,
        isEntranceComplete,
        mentionedLanguage,
        mentionedPropertyOverrides,
        entranceBalloonText,
        setEntranceBalloonText,
        getLabelSpringProps,
        onStanisavSequenceDone,
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
