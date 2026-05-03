import { useRef, useEffect } from "react";
import MeshaHighlight from "./MeshaHighlight.jsx";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAudioData } from "../../hooks/useAudioData.js";
import { createAudioSurface } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

/**
 * MeshaEar
 * @param {object} props
 * @param {boolean} props.isSelected - highlight if selectedProperty matches
 */
const MeshaEar = ({
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
      <mesh
        ref={leftMeshRef}
        position={[-x, y, z]}
        scale={[-0.6, 3 / rightSegments, 1]}
        onClick={onClick}
        linguisticProperty="morphology"
      >
        <shaderMaterial args={[earMaterial]} />
        {isSelected && (
          <MeshaHighlight
            geometry="parametricGeometry"
            geometryArgs={[() => {}, leftSegments, leftSegments]}
          />
        )}
      </mesh>

      <mesh
        ref={rightMeshRef}
        position={[x, y, z]}
        scale={[0.6, 3 / rightSegments, 1]}
        onClick={onClick}
        linguisticProperty="morphology"
      >
        <shaderMaterial args={[earMaterial]} />
        {isSelected && (
          <MeshaHighlight
            geometry="parametricGeometry"
            geometryArgs={[() => {}, rightSegments, rightSegments]}
          />
        )}
      </mesh>
    </>
  );
};

export default MeshaEar;
