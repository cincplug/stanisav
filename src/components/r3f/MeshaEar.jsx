import { useRef, useMemo } from "react";
import MeshaHighlight from "./MeshaHighlight.jsx";
import { extend } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { defaultAudioData } from "../../config/meshaDefaultAudioData.js";
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
  meshaSize,
  bend,
  leftSegments,
  rightSegments,
  onClick,
  isSelected,
}) => {
  const lastAudioDataRef = useRef(defaultAudioData);
  const { audioData: rawAudioData } = useAudioAnimation();

  const audioData = rawAudioData.isSelected
    ? rawAudioData
    : lastAudioDataRef.current;

  if (rawAudioData.isSelected) {
    lastAudioDataRef.current = rawAudioData;
  }

  const audioSurface = useMemo(
    () =>
      createAudioSurface({
        audioData,
        size: meshaSize,
        bend,
        radius: meshaSize,
      }),
    [audioData, meshaSize, bend],
  );

  const { x, y, z } = earPosition;

  return (
    <>
      <mesh
        position={[-x, y, z]}
        scale={[-0.6, 3 / rightSegments, 1]}
        onClick={onClick}
        linguisticProperty="morphology"
      >
        <parametricGeometry args={[audioSurface, leftSegments, leftSegments]} />
        <shaderMaterial args={[earMaterial]} />
        {isSelected && (
          <MeshaHighlight
            geometry="parametricGeometry"
            geometryArgs={[audioSurface, leftSegments, leftSegments]}
          />
        )}
      </mesh>

      <mesh
        position={[x, y, z]}
        scale={[0.6, 3 / rightSegments, 1]}
        onClick={onClick}
        linguisticProperty="morphology"
      >
        <parametricGeometry
          args={[audioSurface, rightSegments, rightSegments]}
        />
        <shaderMaterial args={[earMaterial]} />
        {isSelected && (
          <MeshaHighlight
            geometry="parametricGeometry"
            geometryArgs={[audioSurface, rightSegments, rightSegments]}
          />
        )}
      </mesh>
    </>
  );
};

export default MeshaEar;
