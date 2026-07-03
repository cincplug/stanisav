import { extend } from "@react-three/fiber";
import { useRef } from "react";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { dragBindings } from "../../config/dragBindings.js";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useAudioData } from "../../hooks/useAudioData.js";
import { useMeshaDrag } from "../../hooks/useMeshaDrag.js";
import { useHighlightMaterial } from "../../hooks/useShaderMaterial.js";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { createAudioSurface } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

const MeshaTongue = ({ tongueMaterial, segments, onClick, isSelected }) => {
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
  } = config;

  const meshRef = useRef();

  const stripesType = tongueMaterial?.uniforms?.uStripesType?.value ?? 0;
  const highlightMaterial = useHighlightMaterial(stripesType);

  const bind = useMeshaDrag(dragBindings.tongue, "tonality");

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
        segments,
        segments,
      );
    }
  });

  const activeMaterial = isSelected ? highlightMaterial : tongueMaterial;

  return (
    <mesh
      ref={meshRef}
      position={[tongueX, tongueY, tongueZ]}
      scale={[tongueWidth, tongueHeight, tongueLength]}
      onClick={onClick}
      linguisticProperty="tonality"
      {...bind()}
    >
      <shaderMaterial args={[activeMaterial]} />
    </mesh>
  );
};

export default MeshaTongue;
