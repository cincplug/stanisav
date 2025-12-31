import { useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext";

const StageLight = () => {
  const { camera } = useThree();
  const lightRef = useRef();
  const { controls } = useControls();

  useFrame(() => {
    if (lightRef.current) {
      const direction = camera.position.clone().normalize();
      const fixedDistance = controls.positionZ;
      lightRef.current.position.copy(direction.multiplyScalar(fixedDistance));
    }
  });

  return (
    <pointLight
      ref={lightRef}
      intensity={controls.pointLightIntensity}
      decay={controls.pointLightDecay}
      distance={controls.pointLightDistance}
    />
  );
};

export default StageLight;
