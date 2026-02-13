import { useRef } from "react";
import { Color } from "three";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";

const NodeLights = ({ spread }) => {
  const groupRef = useRef();
  const { controls } = useControls();
  const { nodeLightDistance, nodeLightDecay, nodeLightIntensity } = controls;

  const lightColor = new Color("#ffdd88");

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={groupRef}>
      <pointLight
        position={[-spread, 0, 3]}
        intensity={nodeLightIntensity}
        distance={nodeLightDistance}
        decay={nodeLightDecay}
        color={lightColor}
      />
      <pointLight
        position={[spread, 0, 3]}
        intensity={nodeLightIntensity}
        distance={nodeLightDistance}
        decay={nodeLightDecay}
        color={lightColor}
      />
      <pointLight
        position={[0, 5, 8]}
        intensity={nodeLightIntensity}
        distance={nodeLightDistance}
        decay={nodeLightDecay}
        color={lightColor}
      />
    </group>
  );
};

export default NodeLights;
