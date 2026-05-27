import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useEntrance } from "../../contexts/EntranceContext";
import { useHighlightMaterial } from "../../hooks/useShaderMaterial.js";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { config } from "../../config/../modules/configStore";

const MeshaNose = ({
  position,
  scale,
  segmentColors,
  motionIntensity,
  rotationRef,
  onClick,
  isSelectedOuter,
  isSelectedInner,
}) => {
  const groupRef = useRef();
  const segmentARef = useRef();
  const segmentBRef = useRef();
  const segmentCRef = useRef();
  const { controls } = useControls();
  const { pupilSize } = controls;
  const highlightMaterial = useHighlightMaterial(0, 2);

  const deltaAccRef = useRef(0);

  useThrottledFrame((_, delta) => {
    if (!segmentARef.current || !segmentBRef.current || !segmentCRef.current)
      return;
    const rotation = -rotationRef.current;
    const offset = motionIntensity * rotation * 3;
    segmentARef.current.rotation.y = offset;
    segmentBRef.current.rotation.z = offset;
    segmentCRef.current.rotation.x = offset;
  });

  const segments = 32;

  const { revealedParts } = useEntrance();
  if (!revealedParts.has("nose")) return null;

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh
        ref={segmentARef}
        scale={1}
        linguisticProperty="wordOrder"
        onClick={onClick}
      >
        <sphereGeometry
          args={[pupilSize, segments, segments, -Math.PI / 2, Math.PI]}
        />
        {isSelectedOuter ? (
          <shaderMaterial args={[highlightMaterial]} />
        ) : (
          <meshBasicMaterial color={segmentColors[0]} side={2} />
        )}
      </mesh>

      <mesh
        ref={segmentBRef}
        scale={0.8}
        linguisticProperty="wordOrderFlexibility"
        onClick={onClick}
      >
        <sphereGeometry
          args={[pupilSize, segments, segments, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        {isSelectedInner ? (
          <shaderMaterial args={[highlightMaterial]} />
        ) : (
          <meshBasicMaterial color={segmentColors[1]} side={2} />
        )}
      </mesh>

      <mesh ref={segmentCRef} scale={0.6} linguisticProperty="noseInner">
        <sphereGeometry
          args={[pupilSize, segments, segments, Math.PI, Math.PI, 0, Math.PI]}
        />
        {isSelectedInner ? (
          <shaderMaterial args={[highlightMaterial]} />
        ) : (
          <meshStandardMaterial
            color={segmentColors[2]}
            side={2}
            metalness={0.7}
            roughness={0.4}
          />
        )}
      </mesh>
    </group>
  );
};

export default MeshaNose;
