import { extend } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useConfigContext } from "../../../contexts/ConfigContext.jsx";
import { useAudioData } from "../../../hooks/useAudioData.js";
import { useThrottledFrame } from "../../../hooks/useThrottledFrame.js";
import { createAudioSurface } from "../../../utils/shapeUtils.js";
import { useRef } from "react";

extend({ ParametricGeometry });

const Ears = ({ earMaterial, morphologyScore, isLuka }) => {
  const { config } = useConfigContext();
  const {
    earHeight,
    earWidth,
    earDepth,
    earTwirl,
    earTurns,
    earX,
    earY,
    earZ,
    earSize,
    segmentsBiggest,
    fireAmount,
    maxDeformation,
    verticalVariation,
  } = config;

  const meshRef = useRef();
  const meshRef2 = useRef();
  const bend = morphologyScore * earX;

  const x = earX - morphologyScore;

  const { audioData } = useAudioData();

  useThrottledFrame(() => {
    const { harmonicsData } = audioData;

    const staticSurface = createAudioSurface({
      audioBand: harmonicsData,
      size: earSize,
      bend,
      maxDeformation: !isLuka
        ? maxDeformation
        : maxDeformation * morphologyScore * fireAmount,
      verticalVariation,
      radius: earSize,
      twirl: earTwirl,
      turns: isLuka ? earTurns : earTurns * fireAmount * harmonicsData[6],
    });

    if (meshRef.current) {
      meshRef.current.geometry.dispose();
      meshRef.current.geometry = new ParametricGeometry(
        staticSurface,
        segmentsBiggest,
        segmentsBiggest,
      );
    }
    if (meshRef2.current) {
      meshRef2.current.geometry.dispose();
      meshRef2.current.geometry = new ParametricGeometry(
        staticSurface,
        segmentsBiggest,
        segmentsBiggest,
      );
    }
  });

  return (
    <group position-y={earY} position-z={earZ}>
      <mesh
        ref={meshRef}
        position-x={-x}
        scale={[-earWidth, earHeight / bend, earDepth]}
      >
        <shaderMaterial args={[earMaterial]} />
      </mesh>
      <mesh
        ref={meshRef2}
        position-x={x}
        scale={[earWidth, earHeight / bend, earDepth]}
      >
        <shaderMaterial args={[earMaterial]} />
      </mesh>
    </group>
  );
};

export default Ears;
