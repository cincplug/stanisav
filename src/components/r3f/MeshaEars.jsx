import { extend } from "@react-three/fiber";
import { forwardRef } from "react";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { dragBindings } from "../../config/dragBindings.js";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useMeshaDrag } from "../../hooks/useMeshaDrag.js";
import { useHighlightMaterial } from "../../hooks/useShaderMaterial.js";
import { createAudioSurface } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

const MeshaEars = forwardRef(
  ({ earMaterial, morphologyScore, onClick, isSelected }, ref) => {
    const highlightMaterial = useHighlightMaterial(0);
    const { config } = useConfigContext();
    const {
      earHeight,
      earWidth,
      earDepth,
      earX,
      earY,
      earZ,
      earSize,
      segments,
    } = config;

    const bend = morphologyScore * earX;
    const bind = useMeshaDrag(dragBindings.ears, "morphology");

    const x = earX - morphologyScore;
    const activeMaterial = isSelected ? highlightMaterial : earMaterial;

    const staticSurface = createAudioSurface({
      size: earSize,
      bend,
      radius: earSize,
    });

    return (
      <group ref={ref} position-y={earY} position-z={earZ}>
        <mesh
          position-x={-x}
          scale={[-earWidth, earHeight / bend, earDepth]}
          onClick={onClick}
          linguisticProperty="morphology"
          {...bind()}
        >
          <parametricGeometry args={[staticSurface, segments, segments]} />
          <shaderMaterial args={[activeMaterial]} />
        </mesh>
        <mesh
          position-x={x}
          scale={[earWidth, earHeight / bend, earDepth]}
          onClick={onClick}
          linguisticProperty="morphology"
          {...bind()}
        >
          <parametricGeometry args={[staticSurface, segments, segments]} />
          <shaderMaterial args={[activeMaterial]} />
        </mesh>
      </group>
    );
  },
);

export default MeshaEars;
