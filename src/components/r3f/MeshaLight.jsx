import { useRef } from "react";
import { a } from "@react-spring/three";
import { Color } from "three";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";

const MeshaLight = () => {
  const groupRef = useRef();
  const { controls } = useControls();
  const { meshaLightDistance, meshaLightDecay, meshaLightIntensity } = controls;

  const lightColor = new Color("#ffeedd");
  const spread = 1.5;

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={groupRef}>
      <a.pointLight
        position={[-spread, 0, 3]}
        intensity={meshaLightIntensity}
        distance={meshaLightDistance}
        decay={meshaLightDecay}
        color={lightColor}
      />
      <a.pointLight
        position={[spread, 0, 3]}
        intensity={meshaLightIntensity}
        distance={meshaLightDistance}
        decay={meshaLightDecay}
        color={lightColor}
      />
      <a.pointLight
        position={[0, 3, 5]}
        intensity={meshaLightIntensity}
        distance={meshaLightDistance}
        decay={meshaLightDecay}
        color={lightColor}
      />
    </group>
  );
};

export default MeshaLight;
