import { useRef } from "react";
import { Color } from "three";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";

const NodeLights = ({ labelText }) => {
  const groupRef = useRef();
  const { pointLightDistance } = useControls();
  const lightColor = new Color("#ffdd88");
  const x = labelText.length / 2;

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={groupRef}>
      <pointLight
        position={[-x / 2, -2, 3]}
        intensity={50}
        distance={pointLightDistance}
        color={lightColor}
      />
      <pointLight
        position={[x / 2, -1, 4]}
        intensity={40}
        distance={pointLightDistance}
        color={lightColor}
      />
      <pointLight
        position={[0, -4, 6]}
        intensity={30}
        distance={pointLightDistance}
        color={lightColor}
      />
    </group>
  );
};

export default NodeLights;
