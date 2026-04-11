import { useEffect, useRef, useState } from "react";
import { useSpring } from "@react-spring/three";

export const ENTRANCE_DURATION = 4400;
const REVEAL_DURATION_MS = 500;
const START_RADIUS_FACTOR = 1 / 3;

const toInnerStartPosition = ([x, y, z]) => [
  x * START_RADIUS_FACTOR,
  y * START_RADIUS_FACTOR,
  z * START_RADIUS_FACTOR,
];

export const useEntranceAnimation = (
  finalPosition,
  skipLabelEntrance,
  tension,
  friction,
  revealOrder,
  totalVisibleLabels,
) => {
  const maxRevealDelay = Math.max(0, ENTRANCE_DURATION - REVEAL_DURATION_MS);
  const maxOrder = Math.max(1, totalVisibleLabels - 1);
  const revealDelay = Math.round((revealOrder / maxOrder) * maxRevealDelay);
  const positionDuration = Math.max(0, ENTRANCE_DURATION - revealDelay);

  const entranceStartRef = useRef(null);
  if (entranceStartRef.current === null) {
    entranceStartRef.current = toInnerStartPosition(finalPosition);
  }

  const entranceTargetRef = useRef(null);
  if (entranceTargetRef.current === null) {
    entranceTargetRef.current = [...finalPosition];
  }

  const [phase, setPhase] = useState("entrance");

  const toPosition =
    phase === "entrance" ? entranceTargetRef.current : finalPosition;

  useEffect(() => {
    if (skipLabelEntrance && phase === "entrance") {
      setPhase("live");
    }
  }, [skipLabelEntrance, phase]);

  const positionSpring = useSpring({
    from: { position: entranceStartRef.current },
    to: { position: toPosition },
    delay: phase === "entrance" ? revealDelay : 0,
    config:
      phase === "entrance"
        ? { duration: positionDuration }
        : { tension, friction },
    immediate: skipLabelEntrance && phase === "entrance",
    onRest: ({ finished }) => {
      if (finished && phase === "entrance") {
        setPhase("live");
      }
    },
  });

  const revealSpring = useSpring({
    from: { reveal: 0 },
    to: { reveal: 1 },
    delay: revealDelay,
    config: { duration: REVEAL_DURATION_MS },
    immediate: skipLabelEntrance,
  });

  return { positionSpring, revealSpring };
};
