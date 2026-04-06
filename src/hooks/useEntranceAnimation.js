import { useEffect, useRef, useState } from "react";
import { useSpring } from "@react-spring/three";

const ENTRANCE_DURATION = 5000;

// Config used when a mood is selected mid-entrance: fast but not instant
const SKIP_CONFIG = { tension: 280, friction: 30 };

export const useEntranceAnimation = (
  finalPosition,
  skipLabelEntrance,
  tension,
  friction,
) => {
  // Frozen once at mount — stable `from` that never changes reference or value
  const outerSpaceStart = useRef(null);
  if (outerSpaceStart.current === null) {
    outerSpaceStart.current = [
      finalPosition[0] * 3,
      finalPosition[1] * 3,
      finalPosition[2] * 3,
    ];
  }

  // `inEntrance` drives the config: duration-based during 5s, physics afterwards
  const inEntranceRef = useRef(true);
  const [config, setConfig] = useState({ duration: ENTRANCE_DURATION });

  // Skip mid-entrance: fast but smooth physics snap
  useEffect(() => {
    if (!skipLabelEntrance) return;
    inEntranceRef.current = false;
    setConfig(SKIP_CONFIG);
  }, [skipLabelEntrance]);

  // Declarative spring: stable `from` (ref), reactive `to` (follows finalPosition changes)
  // Config starts as duration-based, switches to physics after entrance settles
  const positionSpring = useSpring({
    from: { position: outerSpaceStart.current },
    to: { position: finalPosition },
    config,
    onRest: ({ finished }) => {
      if (finished && inEntranceRef.current) {
        inEntranceRef.current = false;
        setConfig({ tension, friction });
      }
    },
  });

  return { positionSpring };
};
