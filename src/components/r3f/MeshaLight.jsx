import { useRef } from "react";
import { Color } from "three";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";

const MeshaLight = ({ spread }) => {
  const groupRef = useRef();
  const { controls } = useControls();
  const { meshaLightDistance, meshaLightDecay, meshaLightIntensity } = controls;

  const lightColor = new Color("#ffeedd");

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={groupRef}>
      <pointLight
        position={[-spread, 0, 3]}
        intensity={meshaLightIntensity}
        distance={meshaLightDistance}
        decay={meshaLightDecay}
        color={lightColor}
      />
      <pointLight
        position={[spread, 0, 3]}
        intensity={meshaLightIntensity}
        distance={meshaLightDistance}
        decay={meshaLightDecay}
        color={lightColor}
      />
      <pointLight
        position={[0, 5, 8]}
        intensity={meshaLightIntensity}
        distance={meshaLightDistance}
        decay={meshaLightDecay}
        color={lightColor}
      />
    </group>
  );
};

export default MeshaLight;
