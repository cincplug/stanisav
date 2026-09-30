import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getEntranceSteps } from "../i18n/runtime";
import { useI18nContext } from "./I18nContext";
import { useConfigContext } from "./ConfigContext";
import { useAppStateContext } from "./AppStateContext";

const EntranceContext = createContext(null);

export const EntranceProvider = ({ children }) => {
  const { config } = useConfigContext();
  const { isLocaleReady } = useI18nContext();
  const { isMiniStanisav } = useAppStateContext();

  const entranceSteps = isLocaleReady ? getEntranceSteps() : [];

  const {
    entranceDuration,
    labelRevealDuration,
    startLabelOffset,
    tension,
    friction,
  } = config;

  const isSequenceCancelledRef = useRef(false);

  const [isEntranceComplete, setIsEntranceComplete] = useState(false);

  const toInnerStartPosition = ([x, y, z]) => [
    x * startLabelOffset,
    y * startLabelOffset,
    z * startLabelOffset,
  ];

  const skipSequence = () => {
    isSequenceCancelledRef.current = true;
    setIsEntranceComplete(true);
  };

  useEffect(() => {
    if (isMiniStanisav) {
      skipSequence();
    }
  }, [isMiniStanisav]);

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

export const useEntranceContext = () => {
  const context = useContext(EntranceContext);
  if (!context)
    throw new Error("useEntrance must be used within an EntranceProvider");
  return context;
};
