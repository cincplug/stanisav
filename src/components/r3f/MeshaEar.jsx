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
  onShowTooltip,
  tooltipData,
  selected,
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
        onClick={(e) => onShowTooltip(e, tooltipData)}
        userData={{ isMeshaPart: true }}
      >
        <parametricGeometry
          args={[audioReactiveSurface, leftSegments, leftSegments]}
        />
        <shaderMaterial args={[leftEarMaterial]} />
        {selected && (
          <mesh position={[0, 0, 0]}>
            <parametricGeometry
              args={[audioReactiveSurface, leftSegments, leftSegments]}
            />
            <meshBasicMaterial color="#ff0" wireframe />
          </mesh>
        )}
      </mesh>

      <mesh
        position={[x, y, z]}
        scale={[0.6, 3 / rightSegments, 1]}
        onClick={(e) => onShowTooltip(e, tooltipData)}
        userData={{ isMeshaPart: true }}
      >
        <parametricGeometry
          args={[audioReactiveSurface, rightSegments, rightSegments]}
        />
        <shaderMaterial args={[rightEarMaterial]} />
        {selected && (
          <mesh position={[0, 0, 0]}>
            <parametricGeometry
              args={[audioReactiveSurface, rightSegments, rightSegments]}
            />
            <meshBasicMaterial color="#ff0" wireframe />
          </mesh>
        )}
      </mesh>
    </>
  );
};

export default MeshaEar;
