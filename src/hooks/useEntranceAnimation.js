import { useEffect, useRef, useState } from "react";
import { useSpring } from "@react-spring/three";

const ENTRANCE_DURATION = 5000;
const MIN_RADIUS = 1;
const REVEAL_PORTION = 1 / 2;
const MIN_REVEAL_DURATION_MS = 120;

// Integer hash constants for deterministic per-label seed.
const HASH_QUANTIZATION = 1000;
const HASH_PRIME_X = 7;
const HASH_PRIME_Y = 73;
const HASH_PRIME_Z = 83492791;

// Whirl shape controls.
const BASE_TURNS = 11 / 10;
const EXTRA_TURNS = 2;
const BASE_RADIUS_MULTIPLIER = 3;
const EXTRA_RADIUS_MULTIPLIER = 9 / 10;
const RADIUS_OFFSET = 12;
const PHI_JITTER = 3 / 5;
const PHI_MARGIN = 1 / 10;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

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

// Convert final position to a whirled "outer space" start position.
const toWhirledStartPosition = ([x, y, z]) => {
  const radius = Math.max(Math.sqrt(x * x + y * y + z * z), MIN_RADIUS);
  const theta = Math.atan2(y, x);
  const phi = Math.acos(clamp(z / radius, -1, 1));

  const seed = positionSeed([x, y, z]);
  const direction = seed > 1 / 2 ? 1 : -1;
  const turns = BASE_TURNS + seed * EXTRA_TURNS;

  const startRadius =
    radius * (BASE_RADIUS_MULTIPLIER + seed * EXTRA_RADIUS_MULTIPLIER) +
    RADIUS_OFFSET;
  const startTheta = theta + direction * turns * Math.PI;
  const startPhi = clamp(
    phi + (seed - 1 / 2) * PHI_JITTER,
    PHI_MARGIN,
    Math.PI - PHI_MARGIN,
  );

  const sinPhi = Math.sin(startPhi);
  return [
    startRadius * sinPhi * Math.cos(startTheta),
    startRadius * sinPhi * Math.sin(startTheta),
    startRadius * Math.cos(startPhi),
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
  // Keep entrance endpoints stable to avoid mid-animation retarget bounce.
  const entranceStartRef = useRef(null);
  if (entranceStartRef.current === null) {
    entranceStartRef.current = toWhirledStartPosition(finalPosition);
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

  const revealDuration = Math.max(
    MIN_REVEAL_DURATION_MS,
    Math.round(ENTRANCE_DURATION * REVEAL_PORTION),
  );
  const maxRevealDelay = Math.max(0, ENTRANCE_DURATION - revealDuration);
  const maxOrder = Math.max(1, totalVisibleLabels - 1);
  const revealDelay = Math.round((revealOrder / maxOrder) * maxRevealDelay);

  const revealSpring = useSpring({
    from: { reveal: 0 },
    to: { reveal: 1 },
    delay: revealDelay,
    config: { duration: revealDuration },
    immediate: skipLabelEntrance,
  });

  return { positionSpring, revealSpring };
};
