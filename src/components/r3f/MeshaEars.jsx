import { useRef } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAudioData } from "../../hooks/useAudioData.js";
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
  const leftMeshRef = useRef();
  const rightMeshRef = useRef();
  const leftHighlightRef = useRef();
  const rightHighlightRef = useRef();

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
    if (leftHighlightRef.current && leftMeshRef.current) {
      leftHighlightRef.current.geometry = leftMeshRef.current.geometry;
    }
    if (rightHighlightRef.current && rightMeshRef.current) {
      rightHighlightRef.current.geometry = rightMeshRef.current.geometry;
    }
  });

  const { x, y, z } = earPosition;

  return (
    <>
      <mesh
        ref={leftMeshRef}
        position={[-x, y, z]}
        scale={[-0.6, 3 / rightSegments, 1]}
        onClick={onClick}
        linguisticProperty="morphology"
      >
        <shaderMaterial args={[earMaterial]} />
      </mesh>
      <mesh
        ref={leftHighlightRef}
        position={[-x, y, z]}
        scale={[-0.6, 3 / rightSegments, 1]}
        visible={isSelected}
      >
        <meshBasicMaterial color="#ff0" wireframe />
      </mesh>

      <mesh
        ref={rightMeshRef}
        position={[x, y, z]}
        scale={[0.6, 3 / rightSegments, 1]}
        onClick={onClick}
        linguisticProperty="morphology"
      >
        <shaderMaterial args={[earMaterial]} />
      </mesh>
      <mesh
        ref={rightHighlightRef}
        position={[x, y, z]}
        scale={[0.6, 3 / rightSegments, 1]}
        visible={isSelected}
      >
        <meshBasicMaterial color="#ff0" wireframe />
      </mesh>
    </>
  );
};

export default MeshaEars;
