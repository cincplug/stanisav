import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { shiftHue } from "../../utils/colorUtils";
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
    S: color,
    V: shiftHue(color, -120),
    O: shiftHue(color, 120),
  };
  const subjectColor = colorMap[wordOrder[0]];
  const verbColor = colorMap[wordOrder[1]];
  const objectColor = colorMap[wordOrder[2]];
  const segments = 12;
  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[eyeSize, segments, segments]} />
        <meshStandardMaterial color={"#ffffff"} />
      </mesh>
      <mesh
        ref={irisRef}
        position={[0, 0, pupilZ]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <sphereGeometry args={[irisSize, segments, segments, 0, Math.PI]} />
        <meshStandardMaterial color={subjectColor} side={2} />
      </mesh>
      <mesh ref={pupilRef} position={[0, 0, pupilZ]} rotation={[0, 0, 0]}>
        <sphereGeometry
          args={[
            (pupilSize + irisSize) / 2,
            segments,
            segments,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2,
          ]}
        />
        <meshStandardMaterial color={verbColor} side={2} />
      </mesh>
      <mesh position={[0, 0, pupilZ]}>
        <sphereGeometry args={[pupilSize, segments, segments]} />
        <meshStandardMaterial color={objectColor} />
      </mesh>
    </group>
  );
};
export default MeshaEye;
