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

const MeshaEars = ({
  earMaterial,
  earPosition,
  size,
  bend,
  segments,
  onClick,
  isSelected,
}) => {
  const { audioData } = useAudioData();
  const highlightMaterial = useHighlightMaterial(0);
  const leftMeshRef = useRef();
  const rightMeshRef = useRef();
  const { earHeight, earWidth, earDepth } = config.meshaVisualization;

  const bind = useMeshaDrag(dragBindings.ears, "morphology");

  useThrottledFrame(() => {
    const audioSurface = createAudioSurface({
      audioBand: audioData.fundamentalData,
      size,
      bend,
      radius: size,
    });

    if (leftMeshRef.current) {
      leftMeshRef.current.geometry.dispose();
      leftMeshRef.current.geometry = new ParametricGeometry(
        audioSurface,
        segments,
        segments,
      );
    }
    if (rightMeshRef.current) {
      rightMeshRef.current.geometry.dispose();
      rightMeshRef.current.geometry = new ParametricGeometry(
        audioSurface,
        segments,
        segments,
      );
    }
  });

  const { x, y, z } = earPosition;
  const activeMaterial = isSelected ? highlightMaterial : earMaterial;

  const { revealedParts } = useEntranceContext();
  if (!revealedParts.has("ears")) return null;

  return (
    <>
      <mesh
        ref={leftMeshRef}
        position={[-x, y, z]}
        scale={[-earWidth, earHeight / (segments * 2), earDepth]}
        onClick={onClick}
        linguisticProperty="morphology"
        {...bind()}
      >
        <shaderMaterial args={[activeMaterial]} />
      </mesh>
      <mesh
        ref={rightMeshRef}
        position={[x, y, z]}
        scale={[earWidth, earHeight / (segments * 2), earDepth]}
        onClick={onClick}
        linguisticProperty="morphology"
        {...bind()}
      >
        <shaderMaterial args={[activeMaterial]} />
      </mesh>
    </>
  );
};

export default MeshaEars;
