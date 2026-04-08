import { useEffect, useRef, useState } from "react";
import { useSpring } from "@react-spring/three";

const ENTRANCE_DURATION = 5000;
const POSITION_DURATION_MS = 2000;
const REVEAL_DURATION_MS = 400;
const START_RADIUS_FACTOR = 7 / 8;

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
  revealOrder = 0,
  totalVisibleLabels = 1,
) => {
  const maxRevealDelay = Math.max(0, ENTRANCE_DURATION - REVEAL_DURATION_MS);
  const maxOrder = Math.max(1, totalVisibleLabels - 1);
  const revealDelay = Math.round((revealOrder / maxOrder) * maxRevealDelay);

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
        ? { duration: POSITION_DURATION_MS }
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
