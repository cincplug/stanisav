import { useRef, useState } from "react";
import { useSpring } from "@react-spring/three";
import sceneConfig from "../config/sceneConfig.json";

const { entranceDuration, revealDuration, startRadiusFactor, wrapUpDuration } =
  sceneConfig;

const toInnerStartPosition = ([x, y, z]) => [
  x * startRadiusFactor,
  y * startRadiusFactor,
  z * startRadiusFactor,
];

export const useEntranceAnimation = (
  finalPosition,
  isEntranceComplete,
  isMotionReduced,
  tension,
  friction,
  revealOrder,
  totalVisibleLabels,
) => {
  const maxRevealDelay = Math.max(0, entranceDuration - revealDuration);
  const maxOrder = Math.max(1, totalVisibleLabels - 1);
  const revealDelay = Math.round((revealOrder / maxOrder) * maxRevealDelay);
  const positionDuration = Math.max(0, entranceDuration - revealDelay);

  const entranceStartRef = useRef(null);
  if (entranceStartRef.current === null) {
    entranceStartRef.current = toInnerStartPosition(finalPosition);
  }

  const entranceTargetRef = useRef(null);
  if (entranceTargetRef.current === null) {
    entranceTargetRef.current = [...finalPosition];
  }

  const [hasEnteredLocally, setHasEnteredLocally] = useState(false);

  const toPosition = finalPosition;

  const positionSpring = useSpring({
    from: { position: entranceStartRef.current },
    to: { position: toPosition },
    delay: hasEnteredLocally || isEntranceComplete ? 0 : revealDelay,
    config: { tension, friction },
    immediate: !hasEnteredLocally,
    onRest: ({ finished }) => {
      if (finished && !hasEnteredLocally) {
        setHasEnteredLocally(true);
      }
    },
  });

  const revealSpring = useSpring({
    from: { reveal: 0 },
    to: { reveal: 1 },
    delay: isEntranceComplete ? 0 : revealDelay,
    config: { duration: revealDuration },
    immediate: isMotionReduced,
  });

  return { positionSpring, revealSpring };
};
