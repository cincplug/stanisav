import { useRef, useMemo } from "react";
import MeshaHighlight from "./MeshaHighlight.jsx";
import { extend } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { defaultAudioData } from "../../config/meshaDefaultAudioData.js";
import { createAudioReactiveSurface } from "../../utils/shapeUtils.js";

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

  const audioData = rawAudioData.isActive
    ? rawAudioData
    : lastAudioDataRef.current;

  if (rawAudioData.isActive) {
    lastAudioDataRef.current = rawAudioData;
  }

  const audioReactiveSurface = useMemo(
    () =>
      createAudioReactiveSurface({
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
        <parametricGeometry
          args={[audioReactiveSurface, leftSegments, leftSegments]}
        />
        <shaderMaterial args={[earMaterial]} />
        {isSelected && (
          <MeshaHighlight
            geometry="parametricGeometry"
            geometryArgs={[audioReactiveSurface, leftSegments, leftSegments]}
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
          args={[audioReactiveSurface, rightSegments, rightSegments]}
        />
        <shaderMaterial args={[earMaterial]} />
        {isSelected && (
          <MeshaHighlight
            geometry="parametricGeometry"
            geometryArgs={[audioReactiveSurface, rightSegments, rightSegments]}
          />
        )}
      </mesh>
    </>
  );
};

export default MeshaEar;
