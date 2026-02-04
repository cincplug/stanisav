import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";

const MeshaEye = ({
  position,
  color,
  scale,
  wordOrder,
  wordOrderFlexibility,
}) => {
  const groupRef = useRef();
  const { controls } = useControls();
  const { labelSize } = controls;

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  const eyeSize = labelSize * controls.eyeSize;
  const irisSize = eyeSize * controls.irisSize;
  const pupilSize = eyeSize * controls.pupilSize;
  const irisZ = eyeSize * controls.irisZ;
  const pupilZ = eyeSize * controls.pupilZ;

  const colorMap = {
    V: color,
    O: "#000000",
    S: "#ffffff",
  };

  const whiteColor = colorMap[wordOrder[0]];
  const irisColor = colorMap[wordOrder[1]];
  const pupilColor = colorMap[wordOrder[2]];

  const segments = 12;

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[eyeSize, segments, segments]} />
        <meshStandardMaterial color={whiteColor} />
      </mesh>
      <mesh
        position={[wordOrderFlexibility / 30 + position[0] / 120, 0, irisZ]}
      >
        <sphereGeometry args={[irisSize, segments, segments]} />
        <meshStandardMaterial color={irisColor} />
      </mesh>
      <mesh
        position={[wordOrderFlexibility / 60 - position[0] / 90, 0, pupilZ]}
      >
        <sphereGeometry args={[pupilSize, segments, segments]} />
        <meshStandardMaterial color={pupilColor} />
      </mesh>
    </group>
  );
};

export default MeshaEye;
