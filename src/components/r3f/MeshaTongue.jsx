import { extend } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { defaultAudioData } from "../../config/meshaDefaultAudioData.js";
import { createAudioReactiveSurface } from "../../utils/audioReactiveSurface.js";
import { useRef, useMemo } from "react";

extend({ ParametricGeometry });

const MeshaTongue = ({ mouthMaterial, segments }) => {
  const lastAudioDataRef = useRef(defaultAudioData);
  const { controls } = useControls();
  const { audioData: rawAudioData } = useAudioAnimation();
  const { meshaSize } = controls;

  const audioData = rawAudioData.isActive
    ? rawAudioData
    : lastAudioDataRef.current;

  if (rawAudioData.isActive) {
    lastAudioDataRef.current = rawAudioData;
  }

  const audioReactiveSurface = useMemo(
    () =>
      createAudioReactiveSurface(audioData, {
        size: meshaSize,
        bend: 0,
        radius: meshaSize,
      }),
    [audioData, meshaSize],
  );

  return (
    <mesh
      position={[0, meshaSize * 1.5, meshaSize]}
      scale={[meshaSize / 2, -meshaSize / 4, -meshaSize / 2]}
      rotation={[1 / 4, Math.PI, 0]}
    >
      <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
      <shaderMaterial args={[mouthMaterial]} />
    </mesh>
  );
};

export default MeshaTongue;
