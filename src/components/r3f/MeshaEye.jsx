import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";

const MeshaEye = ({
  position,
  color,
  scale,
  wordOrder,
  wordOrderFlexibilityScore,
  meshaRotationRef,
}) => {
  const groupRef = useRef();
  const irisRef = useRef();
  const pupilRef = useRef();
  const { controls } = useControls();
  const { labelSize } = controls;

  useFrame(() => {
    const rotation = -meshaRotationRef.current;
    const xOffset = (wordOrderFlexibilityScore * rotation) / 4;

    if (irisRef.current) {
      irisRef.current.position.x = xOffset;
    }
    if (pupilRef.current) {
      pupilRef.current.position.x = xOffset;
    }
  });

  const eyeSize = labelSize * controls.eyeSize;
  const irisSize = eyeSize * controls.irisSize;
  const pupilSize = eyeSize * controls.pupilSize;
  const irisZ = eyeSize * controls.irisZ;
  const pupilZ = eyeSize * controls.pupilZ;

  const colorMap = {
    V: color,
    O: "#454545",
    S: "#ffffee",
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
      <mesh ref={irisRef} position={[0, 0, irisZ]}>
        <sphereGeometry args={[irisSize, segments, segments]} />
        <meshStandardMaterial color={irisColor} />
      </mesh>
      <mesh ref={pupilRef} position={[0, -pupilSize / 2, pupilZ]}>
        <sphereGeometry args={[pupilSize, segments, segments]} />
        <meshStandardMaterial color={pupilColor} />
      </mesh>
    </group>
  );
};

export default MeshaEye;
