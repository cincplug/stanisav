import { extend } from "@react-three/fiber";
import { useRef } from "react";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useConfigContext } from "../../../contexts/ConfigContext.jsx";
import { useAudioData } from "../../../hooks/useAudioData.js";
import { useThrottledFrame } from "../../../hooks/useThrottledFrame.js";
import { createAudioSurface } from "../../../utils/shapeUtils.js";

extend({ ParametricGeometry });

const Tongue = ({ tongueMaterial }) => {
  const { audioData } = useAudioData();
  const { config } = useConfigContext();
  const {
    tongueSize,
    tongueX,
    tongueY,
    tongueZ,
    tongueWidth,
    tongueHeight,
    tongueLength,
    maxDeformation,
    verticalVariation,
    segmentsBig,
  } = config;

  const meshRef = useRef();

  useThrottledFrame(() => {
    const { harmonicsData: fundamentalData } = audioData;

    const audioSurface = createAudioSurface({
      audioBand: fundamentalData,
      size: tongueSize,
      bend: 0,
      radius: 1,
      maxDeformation,
      verticalVariation,
    });

    if (meshRef.current) {
      meshRef.current.geometry.dispose();
      meshRef.current.geometry = new ParametricGeometry(
        audioSurface,
        segmentsBig,
        segmentsBig,
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[tongueX, tongueY, tongueZ]}
      scale={[tongueWidth, tongueHeight, tongueLength]}
    >
      <shaderMaterial args={[tongueMaterial]} />
    </mesh>
  );
};

export default Tongue;
