import { useRef } from "react";
import MeshaHighlight from "./MeshaHighlight.jsx";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAudioData } from "../../hooks/useAudioData.js";
import { createAudioSurface } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

// ─── MeshaEar (single ear, internal) ─────────────────────────────────────────

const MeshaEar = ({
  meshRef,
  position,
  scale,
  segments,
  earMaterial,
  onClick,
  isSelected,
}) => (
  <mesh
    ref={meshRef}
    position={position}
    scale={scale}
    onClick={onClick}
    linguisticProperty="morphology"
  >
    <shaderMaterial args={[earMaterial]} />
    {isSelected && (
      <MeshaHighlight
        geometry="parametricGeometry"
        geometryArgs={[() => {}, segments, segments]}
      />
    )}
  </mesh>
);

// ─── MeshaEars (public, owns audio reactivity and positioning) ────────────────

const MeshaEars = ({
  earMaterial,
  earPosition,
  size,
  bend,
  leftSegments,
  rightSegments,
  onClick,
  isSelected,
}) => {
  const { audioData } = useAudioData();
  const leftMeshRef = useRef();
  const rightMeshRef = useRef();

  useFrame(() => {
    const audioSurface = createAudioSurface({
      audioBand: audioData.fundamentalData,
      size,
      bend,
      radius: size,
    });

    if (leftMeshRef.current) {
      leftMeshRef.current.geometry.dispose();
      leftMeshRef.current.geometry = new ParametricGeometry(
        audioSurface,
        leftSegments,
        leftSegments,
      );
    }
    if (rightMeshRef.current) {
      rightMeshRef.current.geometry.dispose();
      rightMeshRef.current.geometry = new ParametricGeometry(
        audioSurface,
        rightSegments,
        rightSegments,
      );
    }
  });

  const { x, y, z } = earPosition;

  return (
    <>
      <MeshaEar
        meshRef={leftMeshRef}
        position={[-x, y, z]}
        scale={[-0.6, 3 / rightSegments, 1]}
        segments={leftSegments}
        earMaterial={earMaterial}
        onClick={onClick}
        isSelected={isSelected}
      />
      <MeshaEar
        meshRef={rightMeshRef}
        position={[x, y, z]}
        scale={[0.6, 3 / rightSegments, 1]}
        segments={rightSegments}
        earMaterial={earMaterial}
        onClick={onClick}
        isSelected={isSelected}
      />
    </>
  );
};

export default MeshaEars;
