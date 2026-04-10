import { useRef } from "react";
import { a, useSpring } from "@react-spring/three";
import { useThree, useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext";
import { useAppState } from "../../contexts/AppStateContext";
import { ENTRANCE_DURATION } from "../../hooks/useEntranceAnimation";

const StageLight = ({ intensity }) => {
  const { camera } = useThree();
  const lightRef = useRef();
  const { controls } = useControls();
  const { skipLabelEntrance } = useAppState();

  const { entranceProgress } = useSpring({
    from: { entranceProgress: 0 },
    to: { entranceProgress: 1 },
    config: { duration: ENTRANCE_DURATION },
    immediate: skipLabelEntrance,
  });

  useFrame(() => {
    if (lightRef.current) {
      const direction = camera.position.clone().normalize();
      const fixedDistance = controls.cameraZ;
      const targetPosition = direction.multiplyScalar(fixedDistance);
      const progress = entranceProgress.get();
      lightRef.current.position.set(
        targetPosition.x,
        targetPosition.y,
        targetPosition.z * progress,
      );
    }
  });

  return (
    <a.pointLight
      ref={lightRef}
      intensity={intensity}
      decay={controls.stageLightDecay}
      distance={controls.stageLightDistance}
      color="#ffeedd"
    />
  );
};

export default StageLight;
