import { useRef, useMemo } from "react";
import MeshaHighlight from "./MeshaHighlight.jsx";
import { extend } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
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
  const { audioData } = useAudioAnimation();

  const audioSurface = useMemo(
    () =>
      createAudioSurface({
        audioBand: audioData.fundamentalData,
        size: meshaSize,
        bend,
        radius: meshaSize,
      }),
    [audioData.fundamentalData, meshaSize, bend],
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
