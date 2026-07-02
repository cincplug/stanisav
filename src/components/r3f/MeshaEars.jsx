import { extend } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { dragBindings } from "../../config/dragBindings.js";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useAudioData } from "../../hooks/useAudioData.js";
import { useMeshaDrag } from "../../hooks/useMeshaDrag.js";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { useHighlightMaterial } from "../../hooks/useShaderMaterial.js";
import { createAudioSurface } from "../../utils/shapeUtils.js";
import { useRef } from "react";

extend({ ParametricGeometry });

const MeshaEars = ({ earMaterial, morphologyScore, onClick, isSelected }) => {
  const highlightMaterial = useHighlightMaterial(0);
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
    segments,
    maxDeformation,
    fireAmount,
    verticalVariation,
  } = config;

  const meshRef = useRef();
  const meshRef2 = useRef();
  const bend = morphologyScore * earX;
  const bind = useMeshaDrag(dragBindings.ears, "morphology");

  const x = earX - morphologyScore;
  const activeMaterial = isSelected ? highlightMaterial : earMaterial;

  const { audioData } = useAudioData();

  useThrottledFrame(() => {
    const { fundamentData } = audioData;

    const staticSurface = createAudioSurface({
      audioBand: fundamentData,
      size: earSize,
      bend,
      maxDeformation: maxDeformation * morphologyScore * fireAmount,
      verticalVariation,
      radius: earSize,
      twirl: earTwirl,
      turns: earTurns * fundamentData[4],
    });

    if (meshRef.current) {
      meshRef.current.geometry.dispose();
      meshRef.current.geometry = new ParametricGeometry(
        staticSurface,
        segments,
        segments,
      );
    }
    if (meshRef2.current) {
      meshRef2.current.geometry.dispose();
      meshRef2.current.geometry = new ParametricGeometry(
        staticSurface,
        segments,
        segments,
      );
    }
  });

  return (
    <group position-y={earY} position-z={earZ}>
      <mesh
        ref={meshRef}
        position-x={-x}
        scale={[-earWidth, earHeight / bend, earDepth]}
        onClick={onClick}
        linguisticProperty="morphology"
        {...bind()}
      >
        <shaderMaterial args={[activeMaterial]} />
      </mesh>
      <mesh
        ref={meshRef2}
        position-x={x}
        scale={[earWidth, earHeight / bend, earDepth]}
        onClick={onClick}
        linguisticProperty="morphology"
        {...bind()}
      >
        <shaderMaterial args={[activeMaterial]} />
      </mesh>
    </group>
  );
};

export default MeshaEars;
