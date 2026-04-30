import { useRef } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { createAudioSurface } from "../../utils/shapeUtils.js";
import MeshaHighlight from "./MeshaHighlight.jsx";

extend({ ParametricGeometry });

const MeshaTongue = ({ tongueMaterial, segments, onClick, isSelected }) => {
  const { controls } = useControls();
  const { audioData } = useAudioAnimation();
  const { meshaSize } = controls;
  const meshRef = useRef();

  useFrame(() => {
    const audioSurface = createAudioSurface({
      audioBand: audioData.harmonicsData,
      size: meshaSize,
      bend: 0,
      radius: meshaSize,
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

  return (
    <mesh
      ref={meshRef}
      position={[0, meshaSize, meshaSize]}
      scale={[meshaSize / 3, -meshaSize / 6, -meshaSize]}
      rotation={[0, Math.PI, 0]}
      onClick={onClick}
      linguisticProperty="tonality"
    >
      <shaderMaterial args={[tongueMaterial]} />
      {isSelected && (
        <MeshaHighlight
          geometry="parametricGeometry"
          geometryArgs={[() => {}, segments, segments]}
        />
      )}
    </mesh>
  );
};

export default MeshaTongue;
