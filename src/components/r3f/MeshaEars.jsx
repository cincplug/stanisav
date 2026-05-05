import { useRef } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAudioData } from "../../hooks/useAudioData.js";
import { useHighlightMaterial } from "../../hooks/useShaderMaterial.js";
import { createAudioSurface } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

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
  const highlightMaterial = useHighlightMaterial(0);
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
      leftMeshRef.current.geometry = new ParametricGeometry(audioSurface, leftSegments, leftSegments);
    }
    if (rightMeshRef.current) {
      rightMeshRef.current.geometry.dispose();
      rightMeshRef.current.geometry = new ParametricGeometry(audioSurface, rightSegments, rightSegments);
    }
  });

  const { x, y, z } = earPosition;
  const activeMaterial = isSelected ? highlightMaterial : earMaterial;

  return (
    <>
      <mesh ref={leftMeshRef} position={[-x, y, z]} scale={[-0.6, 3 / rightSegments, 1]} onClick={onClick} linguisticProperty="morphology">
        <shaderMaterial args={[activeMaterial]} />
      </mesh>
      <mesh ref={rightMeshRef} position={[x, y, z]} scale={[0.6, 3 / rightSegments, 1]} onClick={onClick} linguisticProperty="morphology">
        <shaderMaterial args={[activeMaterial]} />
      </mesh>
    </>
  );
};

export default MeshaEars;
