import { useRef } from "react";
import { a } from "@react-spring/three";
import { Color } from "three";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";

const MeshaLight = ({ spread, intensityMultiplier = 1 }) => {
  const groupRef = useRef();
  const { controls } = useControls();
  const { meshaLightDistance, meshaLightDecay, meshaLightIntensity } = controls;

  const lightColor = new Color("#ffeedd");

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  const intensity =
    typeof intensityMultiplier?.to === "function"
      ? intensityMultiplier.to((m) => meshaLightIntensity * m)
      : meshaLightIntensity * intensityMultiplier;

  return (
    <group ref={groupRef}>
      <a.pointLight
        position={[-spread, 0, 3]}
        intensity={intensity}
        distance={meshaLightDistance}
        decay={meshaLightDecay}
        color={lightColor}
      />
      <a.pointLight
        position={[spread, 0, 3]}
        intensity={intensity}
        distance={meshaLightDistance}
        decay={meshaLightDecay}
        color={lightColor}
      />
      <a.pointLight
        position={[0, 5, 8]}
        intensity={intensity}
        distance={meshaLightDistance}
        decay={meshaLightDecay}
        color={lightColor}
      />
    </group>
  );
};

export default MeshaLight;
