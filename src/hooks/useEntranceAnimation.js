import { useEffect, useRef, useState } from "react";
import { useSpring } from "@react-spring/three";

const ENTRANCE_DURATION = 5000;

export const useEntranceAnimation = (
  finalPosition,
  skipLabelEntrance,
  tension,
  friction,
) => {
  // Keep entrance endpoints stable to avoid mid-animation retarget bounce.
  const entranceStartRef = useRef(null);
  if (entranceStartRef.current === null) {
    entranceStartRef.current = [
      finalPosition[0] * 3,
      finalPosition[1] * 3,
      finalPosition[2] * 3,
    ];
  }

  const entranceTargetRef = useRef(null);
  if (entranceTargetRef.current === null) {
    entranceTargetRef.current = [...finalPosition];
  }

  const [phase, setPhase] = useState("entrance");

  // During entrance, always target the frozen initial layout position.
  // After entrance, follow live finalPosition updates with controls spring config.
  const toPosition =
    phase === "entrance" ? entranceTargetRef.current : finalPosition;

  // If splash interaction happens mid-entrance, finish entrance immediately.
  useEffect(() => {
    if (skipLabelEntrance && phase === "entrance") {
      setPhase("live");
    }
  }, [skipLabelEntrance, phase]);

  const positionSpring = useSpring({
    from: { position: entranceStartRef.current },
    to: { position: toPosition },
    config:
      phase === "entrance"
        ? { duration: ENTRANCE_DURATION }
        : { tension, friction },
    immediate: skipLabelEntrance && phase === "entrance",
    onRest: ({ finished }) => {
      if (finished && phase === "entrance") {
        setPhase("live");
      }
    },
  });

  return { positionSpring };
};
