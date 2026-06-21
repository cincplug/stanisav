import { a } from "@react-spring/three";
import { useRef } from "react";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";

const MeshaLight = () => {
  const groupRef = useRef();
  const { config } = useConfigContext();
  const { intensity, decay, distance, spread, z } = config.meshaLight;
  const { lightColor } = config.colors;

  useThrottledFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={groupRef}>
      <a.pointLight
        position={[-spread, 0, z]}
        intensity={intensity}
        distance={distance}
        decay={decay}
        color={lightColor}
      />
      <a.pointLight
        position={[spread, 0, z]}
        intensity={intensity}
        distance={distance}
        decay={decay}
        color={lightColor}
      />
      <a.pointLight
        position={[0, spread, z]}
        intensity={intensity}
        distance={distance}
        decay={decay}
        color={lightColor}
      />
    </group>
  );
};

export default MeshaLight;
