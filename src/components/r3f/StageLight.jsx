import { useRef } from "react";
import { a, useSpring } from "@react-spring/three";
import { useThree } from "@react-three/fiber";
import { useThrottledFrame } from "../../hooks/useThrottledFrame";
import { useControls } from "../../contexts/ControlsContext";
import { config } from "../../config/../modules/configStore";

const { entranceDuration, stageLight } = config;

const StageLight = ({
  cameraZ,
  isMotionReduced,
  isEntranceComplete,
  tension,
  friction,
  isSegmented,
  selectedLanguage,
}) => {
  const { camera, controls: threeControls } = useThree();
  const { controls } = useControls();
  const { light } = controls;
  const lightRef = useRef();

  const { entranceProgress } = useSpring({
    from: { entranceProgress: 1 / 2 },
    to: { entranceProgress: 1 },
    config: {
      duration: isEntranceComplete ? 0 : entranceDuration,
    },
    immediate: isMotionReduced,
  });

  const distanceKey =
    isSegmented && selectedLanguage
      ? "segmentedSelected"
      : isSegmented
        ? "segmented"
        : selectedLanguage
          ? "selected"
          : "default";

  const { animatedDistance } = useSpring({
    animatedDistance: stageLight.distance[distanceKey],
    config: { tension, friction },
  });

  useThrottledFrame(() => {
    if (!lightRef.current) return;

    const progress = entranceProgress.get();

    if (isSegmented && threeControls?.target) {
      const target = threeControls.target;
      lightRef.current.position.set(
        target.x * progress,
        target.y * progress,
        (target.z + cameraZ) * progress,
      );
    } else {
      const direction = camera.position.clone().normalize();
      const targetPosition = direction.multiplyScalar(cameraZ);
      lightRef.current.position.set(
        targetPosition.x * progress,
        targetPosition.y * progress,
        targetPosition.z * progress,
      );
    }
  });

  return (
    <a.pointLight
      ref={lightRef}
      intensity={stageLight.intensity * light}
      decay={stageLight.decay}
      distance={animatedDistance}
      color="#ffeedd"
    />
  );
};

export default StageLight;
