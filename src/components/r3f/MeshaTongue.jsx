import { extend } from "@react-three/fiber";
import { useRef } from "react";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { dragBindings } from "../../config/dragBindings.js";
import { useEntranceContext } from "../../contexts/EntranceContext";
import { useAudioData } from "../../hooks/useAudioData.js";
import { useMeshaDrag } from "../../hooks/useMeshaDrag.js";
import { useHighlightMaterial } from "../../hooks/useShaderMaterial.js";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { config } from "../../modules/configStore";
import { createAudioSurface } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

const MeshaTongue = ({ tongueMaterial, segments, onClick, isSelected }) => {
  const { audioData } = useAudioData();
  const {
    tongueSize,
    tongueX,
    tongueY,
    tongueZ,
    tongueWidth,
    tongueHeight,
    tongueLength,
  } = config.meshaVisualization;

  const meshRef = useRef();

  const stripesType = tongueMaterial?.uniforms?.uStripesType?.value ?? 0;
  const highlightMaterial = useHighlightMaterial(stripesType);

  const bind = useMeshaDrag(dragBindings.tongue, "tonality");

  useThrottledFrame(() => {
    const { harmonicsData } = audioData;

    const audioSurface = createAudioSurface({
      audioBand: harmonicsData,
      size: tongueSize,
      bend: 0,
      radius: 1,
    });

    if (meshRef.current) {
      meshRef.current.geometry.dispose();
      meshRef.current.geometry = new ParametricGeometry(
        audioSurface,
        segments,
        segments,
      );
      meshRef.current.rotation.x = harmonicsData[0] / 12;
    }
  });

  const activeMaterial = isSelected ? highlightMaterial : tongueMaterial;

  const { revealedParts } = useEntranceContext();
  if (!revealedParts.has("tongue")) return null;

  return (
    <mesh
      ref={meshRef}
      position={[tongueX, tongueY, tongueZ]}
      scale={[tongueWidth, -tongueHeight, -tongueLength]}
      onClick={onClick}
      linguisticProperty="tonality"
      {...bind()}
    >
      <shaderMaterial args={[activeMaterial]} />
    </mesh>
  );
};

export default MeshaTongue;
