import { useRef } from "react";
import { a, useSpring } from "@react-spring/three";
import { useThree, useFrame } from "@react-three/fiber";
import { ENTRANCE_DURATION } from "../../hooks/useEntranceAnimation";

const StageLight = ({
  stageLightIntensity,
  stageLightDecay,
  stageLightDistance,
  cameraZ,
  skipEntrance,
}) => {
  const { camera } = useThree();
  const lightRef = useRef();

  const { entranceProgress } = useSpring({
    from: { entranceProgress: 1 / 2 },
    to: { entranceProgress: 1 },
    config: { duration: ENTRANCE_DURATION },
    immediate: skipEntrance,
  });

  useFrame(() => {
    if (lightRef.current) {
      const direction = camera.position.clone().normalize();
      const targetPosition = direction.multiplyScalar(cameraZ);
      const progress = entranceProgress.get();
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
      intensity={stageLightIntensity}
      decay={stageLightDecay}
      distance={stageLightDistance}
      color="#ffeedd"
    />
  );
};

export default StageLight;
