import { useRef } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAudioData } from "../../hooks/useAudioData.js";
import { createAudioSurface } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

const MeshaTongue = ({ tongueMaterial, segments, onClick, isSelected }) => {
  const { controls } = useControls();
  const { audioData } = useAudioData();
  const { meshaSize } = controls;
  const meshRef = useRef();
  const highlightRef = useRef();

  useFrame(() => {
    const { harmonicsData } = audioData;

    const audioSurface = createAudioSurface({
      audioBand: harmonicsData,
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
      meshRef.current.rotation.x = harmonicsData[0] + Math.PI / 12;
    }
    if (highlightRef.current && meshRef.current) {
      highlightRef.current.geometry = meshRef.current.geometry;
      highlightRef.current.rotation.x = meshRef.current.rotation.x;
    }
  });

  const meshProps = {
    position: [0, meshaSize, meshaSize],
    scale: [meshaSize / 3, -meshaSize / 6, -meshaSize],
    rotation: [0, Math.PI, 0],
  };

  return (
    <>
      <mesh
        ref={meshRef}
        {...meshProps}
        onClick={onClick}
        linguisticProperty="tonality"
      >
        <shaderMaterial args={[tongueMaterial]} />
      </mesh>
      <mesh ref={highlightRef} {...meshProps} visible={isSelected}>
        <meshBasicMaterial color="#ff0" wireframe />
      </mesh>
    </>
  );
};

export default MeshaTongue;
