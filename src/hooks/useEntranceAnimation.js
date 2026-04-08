import { useEffect, useRef, useState } from "react";
import { useSpring } from "@react-spring/three";

const ENTRANCE_DURATION = 5000;
const POSITION_DURATION_MS = 550;
const REVEAL_DURATION_MS = 180;
const MIN_POSITION_OFFSET = 1 / 4;
const EXTRA_POSITION_OFFSET = 1 / 3;
const Z_OFFSET_RANGE = 1 / 3;

// Integer hash constants for deterministic per-label seed.
const HASH_QUANTIZATION = 1000;
const HASH_PRIME_X = 7;
const HASH_PRIME_Y = 73;
const HASH_PRIME_Z = 83492791;

// Deterministic pseudo-random seed from final coordinates.
const positionSeed = ([x, y, z]) => {
  const qx = Math.round(x * HASH_QUANTIZATION);
  const qy = Math.round(y * HASH_QUANTIZATION);
  const qz = Math.round(z * HASH_QUANTIZATION);

  // Convert quantized coordinates into a stable 32-bit hash, then normalize to [0, 1).
  const mixed =
    Math.imul(qx, HASH_PRIME_X) ^
    Math.imul(qy, HASH_PRIME_Y) ^
    Math.imul(qz, HASH_PRIME_Z);
  return (mixed >>> 0) / 2 ** 32;
};

// Keep the entrance subtle by starting from a nearby deterministic offset.
const toNearbyStartPosition = ([x, y, z]) => {
  const seed = positionSeed([x, y, z]);
  const angle = seed * Math.PI * 2;
  const distance = MIN_POSITION_OFFSET + seed * EXTRA_POSITION_OFFSET;
  const zOffset = (seed - 1 / 2) * Z_OFFSET_RANGE;

  return [
    x + Math.cos(angle) * distance,
    y + Math.sin(angle) * distance,
    z + zOffset,
  ];
};

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

  // Keep entrance endpoints stable to avoid mid-animation retarget bounce.
  const entranceStartRef = useRef(null);
  if (entranceStartRef.current === null) {
    entranceStartRef.current = toNearbyStartPosition(finalPosition);
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
