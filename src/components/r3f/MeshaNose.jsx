import { useRef } from "react";
import MeshaHighlight from "./MeshaHighlight.jsx";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";

const MeshaNose = ({
  position,
  scale,
  segmentColors,
  motionIntensity,
  lookAroundRotationRef,
  onShowTooltip,
  isSelectedOuter,
  isSelectedInner,
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
    const rotation = -lookAroundRotationRef.current;
    const offset = motionIntensity * rotation * 3;
    segmentARef.current.rotation.y = offset;
    segmentBRef.current.rotation.z = offset;
    segmentCRef.current.rotation.x = offset;
  });

  const segments = 12;

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh
        ref={segmentARef}
        scale={1}
        meshaPart="noseOuter"
        onClick={onShowTooltip}
      >
        <sphereGeometry
          args={[pupilSize, segments, segments, -Math.PI / 2, Math.PI]}
        />
        <meshStandardMaterial color={segmentColors[0]} side={2} />
        {isSelectedOuter && (
          <MeshaHighlight
            geometry="sphereGeometry"
            geometryArgs={[
              pupilSize,
              segments,
              segments,
              -Math.PI / 2,
              Math.PI,
            ]}
          />
        )}
      </mesh>
      <mesh
        ref={segmentBRef}
        scale={0.8}
        meshaPart="noseInner"
        onClick={onShowTooltip}
      >
        <sphereGeometry
          args={[pupilSize, segments, segments, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshStandardMaterial color={segmentColors[1]} side={2} />
        {isSelectedInner && (
          <MeshaHighlight
            geometry="sphereGeometry"
            geometryArgs={[
              pupilSize,
              segments,
              segments,
              0,
              Math.PI * 2,
              0,
              Math.PI / 2,
            ]}
          />
        )}
      </mesh>
      <mesh ref={segmentCRef} scale={0.6} meshaPart="noseInner">
        <sphereGeometry
          args={[pupilSize, segments, segments, Math.PI, Math.PI, 0, Math.PI]}
        />
        <meshStandardMaterial color={segmentColors[2]} side={2} />
        {isSelectedInner && (
          <MeshaHighlight
            geometry="sphereGeometry"
            geometryArgs={[
              pupilSize,
              segments,
              segments,
              Math.PI,
              Math.PI,
              0,
              Math.PI,
            ]}
          />
        )}
      </mesh>
    </group>
  );
};

export default MeshaNose;
