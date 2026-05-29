import { a } from "@react-spring/three";
import { useRef } from "react";
import { Color } from "three";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { config } from "../../modules/configStore";

const MeshaLight = () => {
  const groupRef = useRef();
  const { intensity, decay, distance, color, spread, z } = config.meshaLight;
  const lightColor = new Color(color);

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
