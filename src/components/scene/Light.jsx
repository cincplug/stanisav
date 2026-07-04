import { a, useSpring } from "@react-spring/three";
import { useThree } from "@react-three/fiber";
import { useRef } from "react";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useThrottledFrame } from "../../hooks/useThrottledFrame";

const Light = ({
  cameraZ,
  isMotionReduced,
  isEntranceComplete,
  tension,
  friction,
  isBlackboard,
  selectedLanguage,
}) => {
  const { camera, controls: threeControls } = useThree();
  const { config } = useConfigContext();
  const {
    lightColor,
    entranceDuration,
    defaultLightDistance,
    zoomedLightDistance,
    defaultLightIntensity,
    zoomedLightIntensity,
    lightDecay,
    ambientLight,
    boardLight,
  } = config;

  const lightRef = useRef();
  const { entranceProgress } = useSpring({
    from: { entranceProgress: 1 / 2 },
    to: { entranceProgress: 1 },
    config: {
      duration: isEntranceComplete ? 0 : entranceDuration,
    },
    immediate: isMotionReduced,
  });

  const { animatedDistance, animatedIntensity } = useSpring({
    animatedDistance:
      (selectedLanguage ? zoomedLightDistance : defaultLightDistance) *
      (isBlackboard ? boardLight : 1),
    animatedIntensity: selectedLanguage
      ? zoomedLightIntensity
      : defaultLightIntensity,
    config: { tension, friction },
  });

  useThrottledFrame(() => {
    if (!lightRef.current) return;

    const progress = entranceProgress.get();

    if (isBlackboard && threeControls?.target) {
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
    <>
      <ambientLight color={lightColor} intensity={ambientLight}></ambientLight>
      <a.pointLight
        ref={lightRef}
        intensity={animatedIntensity}
        decay={lightDecay}
        distance={animatedDistance}
        color={lightColor}
      />
    </>
  );
};

export default Light;
