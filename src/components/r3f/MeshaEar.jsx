import { useRef, useMemo } from "react";
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
      <mesh position={[-x, y, z]} scale={[-0.6, 3 / rightSegments, 1]}>
        <parametricGeometry
          args={[audioReactiveSurface, leftSegments, leftSegments]}
        />
        <shaderMaterial args={[leftEarMaterial]} />
      </mesh>

      <mesh position={[x, y, z]} scale={[0.6, 3 / rightSegments, 1]}>
        <parametricGeometry
          args={[audioReactiveSurface, rightSegments, rightSegments]}
        />
        <shaderMaterial args={[rightEarMaterial]} />
      </mesh>
    </>
  );
};

export default MeshaEar;
