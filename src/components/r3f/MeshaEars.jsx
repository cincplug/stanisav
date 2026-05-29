import { extend } from "@react-three/fiber";
import { useRef } from "react";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useEntrance } from "../../contexts/EntranceContext";
import { useAudioData } from "../../hooks/useAudioData.js";
import { useHighlightMaterial } from "../../hooks/useShaderMaterial.js";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { createAudioSurface } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

const MeshaEars = ({
  earMaterial,
  earPosition,
  size,
  bend,
  segments,
  onClick,
  isSelected,
}) => {
  const { audioData } = useAudioData();
  const highlightMaterial = useHighlightMaterial(0);
  const leftMeshRef = useRef();
  const rightMeshRef = useRef();

  useThrottledFrame(() => {
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
        segments,
        segments,
      );
    }
    if (rightMeshRef.current) {
      rightMeshRef.current.geometry.dispose();
      rightMeshRef.current.geometry = new ParametricGeometry(
        audioSurface,
        segments,
        segments,
      );
    }
  });

  const { x, y, z } = earPosition;
  const activeMaterial = isSelected ? highlightMaterial : earMaterial;

  const { revealedParts } = useEntrance();
  if (!revealedParts.has("ears")) return null;

  return (
    <>
      <mesh
        ref={leftMeshRef}
        position={[-x, y, z]}
        scale={[-0.6, 3 / segments, 1]}
        onClick={onClick}
        linguisticProperty="morphology"
      >
        <shaderMaterial args={[activeMaterial]} />
      </mesh>
      <mesh
        ref={rightMeshRef}
        position={[x, y, z]}
        scale={[0.6, 3 / segments, 1]}
        onClick={onClick}
        linguisticProperty="morphology"
      >
        <shaderMaterial args={[activeMaterial]} />
      </mesh>
    </>
  );
};

export default MeshaEars;
