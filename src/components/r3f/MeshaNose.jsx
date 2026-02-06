import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { shiftHue } from "../../utils/colorUtils";

const MeshaNose = ({
  position,
  color,
  scale,
  wordOrder,
  wordOrderFlexibilityScore,
  meshaRotationRef,
}) => {
  const groupRef = useRef();
  const subjectRef = useRef();
  const verbRef = useRef();
  const objectRef = useRef();
  const { controls } = useControls();
  const { pupilSize } = controls;

  useFrame(() => {
    const rotation = -meshaRotationRef.current;
    const yOffset = wordOrderFlexibilityScore * rotation * 3;
    subjectRef.current.rotation.y = yOffset;
    verbRef.current.rotation.z = yOffset;
    objectRef.current.rotation.x = yOffset;
  });

  const colorMap = {
    S: "#ffffff",
    V: color,
    O: "#222222",
  };
  const subjectColor = colorMap[wordOrder[0]];
  const verbColor = colorMap[wordOrder[1]];
  const objectColor = colorMap[wordOrder[2]];
  const segments = 12;

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Left hemisphere */}
      <mesh ref={subjectRef} scale={1}>
        <sphereGeometry
          args={[pupilSize, segments, segments, -Math.PI / 2, Math.PI]}
        />
        <meshStandardMaterial color={subjectColor} side={2} />
      </mesh>
      {/* Top hemisphere */}
      <mesh ref={verbRef} scale={0.8}>
        <sphereGeometry
          args={[pupilSize, segments, segments, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshStandardMaterial color={verbColor} side={2} />
      </mesh>
      {/* Back hemisphere */}
      <mesh ref={objectRef} scale={0.6}>
        <sphereGeometry
          args={[pupilSize, segments, segments, Math.PI, Math.PI, 0, Math.PI]}
        />
        <meshStandardMaterial color={objectColor} side={2} />
      </mesh>
    </group>
  );
};
export default MeshaNose;
