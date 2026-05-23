import { useRef } from "react";
import { useSpring } from "@react-spring/three";
import sceneConfig from "../config/sceneConfig.json";

const { entranceDuration, revealDuration, startRadiusFactor } = sceneConfig;

const toInnerStartPosition = ([x, y, z]) => [
  x * startRadiusFactor,
  y * startRadiusFactor,
  z * startRadiusFactor,
];

export const useEntranceAnimation = (
  finalPosition,
  isEntranceComplete,
  isMotionReduced,
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

  const entranceStartRef = useRef(null);
  if (entranceStartRef.current === null) {
    entranceStartRef.current = toInnerStartPosition(finalPosition);
  }

  const positionSpring = useSpring({
    from: { position: entranceStartRef.current },
    to: { position: finalPosition },
    immediate: isMotionReduced,
  });

  const revealSpring = useSpring({
    from: { reveal: 0 },
    to: { reveal: 1 },
    delay,
    config: { duration: revealDuration },
    immediate: isMotionReduced,
  });

  return { positionSpring, revealSpring };
};
