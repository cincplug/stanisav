import { useRef, useMemo } from "react";
import MeshaHighlight from "./MeshaHighlight.jsx";
import { extend } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { defaultAudioData } from "../../config/meshaDefaultAudioData.js";
import { createAudioReactiveSurface } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

const MeshaEar = ({
  leftEarMaterial,
  rightEarMaterial,
  meshaSize,
  bend,
  leftSegments,
  rightSegments,
  earPosition,
  onShowTooltip,
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
        onClick={onShowTooltip}
        meshaPart="ear"
      >
        <parametricGeometry
          args={[audioReactiveSurface, leftSegments, leftSegments]}
        />
        <shaderMaterial args={[leftEarMaterial]} />
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
        onClick={onShowTooltip}
        meshaPart="ear"
      >
        <parametricGeometry
          args={[audioReactiveSurface, rightSegments, rightSegments]}
        />
        <shaderMaterial args={[rightEarMaterial]} />
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
