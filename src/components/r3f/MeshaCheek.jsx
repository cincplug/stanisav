import { useRef, useMemo } from "react";
import { extend } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { defaultAudioData } from "../../config/meshaDefaultAudioData.js";
import { createAudioReactiveSurface } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

const MeshaCheek = ({
  leftCheekMaterial,
  rightCheekMaterial,
  meshaSize,
  bend,
  leftSegments,
  rightSegments,
  cheekPosition,
}) => {
  const mesh1Ref = useRef();
  const mesh2Ref = useRef();
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

  const { x, y, z } = cheekPosition;

  return (
    <>
      <mesh
        ref={mesh2Ref}
        position={[-x, y, z]}
        scale={[-0.6, 3 / rightSegments, 1]}
      >
        <parametricGeometry
          args={[audioReactiveSurface, leftSegments, leftSegments]}
        />
        <shaderMaterial args={[leftCheekMaterial]} />
      </mesh>

      <mesh
        ref={mesh1Ref}
        position={[x, y, z]}
        scale={[0.6, 3 / rightSegments, 1]}
      >
        <parametricGeometry
          args={[audioReactiveSurface, rightSegments, rightSegments]}
        />
        <shaderMaterial args={[rightCheekMaterial]} />
      </mesh>
    </>
  );
};

export default MeshaCheek;
