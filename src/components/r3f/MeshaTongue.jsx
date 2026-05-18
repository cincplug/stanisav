import { useRef } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAudioData } from "../../hooks/useAudioData.js";
import { useHighlightMaterial } from "../../hooks/useShaderMaterial.js";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { createAudioSurface } from "../../utils/shapeUtils.js";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";

extend({ ParametricGeometry });

const MeshaTongue = ({ tongueMaterial, segments, onClick, isSelected }) => {
  const { controls } = useControls();
  const { audioData } = useAudioData();
  const { tongueSize } = controls;
  const meshRef = useRef();

  // Pass tongueMaterial's stripesType so highlight keeps the stripes visible.
  // tongueMaterial.uniforms.uStripesType.value carries the language's stripesType.
  const stripesType = tongueMaterial?.uniforms?.uStripesType?.value ?? 0;
  const highlightMaterial = useHighlightMaterial(stripesType);

  const deltaAccRef = useRef(0);

  useThrottledFrame((_, delta) => {
    const { harmonicsData } = audioData;

    // size and radius normalized to 1; overall scale comes from root group in Mesha.jsx
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
      meshRef.current.rotation.x = harmonicsData[0] / 8;
    }
  });

  const activeMaterial = isSelected ? highlightMaterial : tongueMaterial;

  return (
    <mesh
      ref={meshRef}
      position={[0, 2, 1]}
      scale={[1 / 3, -1 / 6, -1]}
      rotation={[0, 0, 0]}
      onClick={onClick}
      linguisticProperty="tonality"
    >
      <shaderMaterial args={[activeMaterial]} />
    </mesh>
  );
};

export default MeshaTongue;
