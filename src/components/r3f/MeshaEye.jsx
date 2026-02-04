import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";

const MeshaEye = ({ position, color, scale, wordOrder }) => {
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

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[eyeSize, 32, 32]} />
        <meshStandardMaterial color={whiteColor} />
      </mesh>
      <mesh position={[0, 0, irisZ]}>
        <sphereGeometry args={[irisSize, 32, 32]} />
        <meshStandardMaterial color={irisColor} />
      </mesh>
      <mesh position={[0, 0, pupilZ]}>
        <sphereGeometry args={[pupilSize, 32, 32]} />
        <meshStandardMaterial color={pupilColor} />
      </mesh>
    </group>
  );
};

export default MeshaEye;
