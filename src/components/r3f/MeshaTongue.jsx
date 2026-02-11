import { extend } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { defaultAudioData } from "../../config/meshaDefaultAudioData.js";
import { useRef } from "react";

extend({ ParametricGeometry });

const MeshaTongue = ({ mouthMaterial, audioReactiveSurface, segments }) => {
  const lastAudioDataRef = useRef(defaultAudioData);
  const { controls } = useControls();
  const { audioData: rawAudioData } = useAudioAnimation();
  const { meshaSize } = controls;

  let audioData;
  if (rawAudioData.isActive) {
    audioData = rawAudioData;
    lastAudioDataRef.current = rawAudioData;
  } else {
    audioData = lastAudioDataRef.current;
  }

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
