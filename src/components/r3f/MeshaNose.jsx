import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";

const MeshaNose = ({
  position,
  scale,
  segmentColors = ["#ffffff", "#888888", "#222222"],
  motionIntensity = 0,
  meshaRotationRef,
}) => {
  const groupRef = useRef();
  const segmentARef = useRef();
  const segmentBRef = useRef();
  const segmentCRef = useRef();
  const { controls } = useControls();
  const { pupilSize } = controls;

  useFrame(() => {
    if (!segmentARef.current || !segmentBRef.current || !segmentCRef.current) {
      return;
    }
    const rotation = -meshaRotationRef.current;
    const offset = motionIntensity * rotation * 3;
    segmentARef.current.rotation.y = offset;
    segmentBRef.current.rotation.z = offset;
    segmentCRef.current.rotation.x = offset;
  });

  const segments = 12;

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh ref={segmentARef} scale={1}>
        <sphereGeometry
          args={[pupilSize, segments, segments, -Math.PI / 2, Math.PI]}
        />
        <meshStandardMaterial color={segmentColors[0]} side={2} />
      </mesh>
      <mesh ref={segmentBRef} scale={0.8}>
        <sphereGeometry
          args={[pupilSize, segments, segments, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshStandardMaterial color={segmentColors[1]} side={2} />
      </mesh>
      <mesh ref={segmentCRef} scale={0.6}>
        <sphereGeometry
          args={[pupilSize, segments, segments, Math.PI, Math.PI, 0, Math.PI]}
        />
        <meshStandardMaterial color={segmentColors[2]} side={2} />
      </mesh>
    </group>
  );
};

export default MeshaNose;
