import { useRef } from "react";
import { a } from "@react-spring/three";
import { useThree, useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext";

const StageLight = ({ intensity }) => {
  const { camera } = useThree();
  const lightRef = useRef();
  const { controls } = useControls();

  useFrame(() => {
    if (lightRef.current) {
      const direction = camera.position.clone().normalize();
      const fixedDistance = controls.cameraZ;
      lightRef.current.position.copy(direction.multiplyScalar(fixedDistance));
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
