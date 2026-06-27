import { extend } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { dragBindings } from "../../config/dragBindings.js";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useMeshaDrag } from "../../hooks/useMeshaDrag.js";
import { useHighlightMaterial } from "../../hooks/useShaderMaterial.js";
import { createAudioSurface } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

const MeshaEars = ({ earMaterial, morphologyScore, onClick, isSelected }) => {
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
    maxDeformation,
    verticalVariation,
    segments,
  } = config;

  const bend = morphologyScore * earX;
  const bind = useMeshaDrag(dragBindings.ears, "morphology");

  const position = {
    x: earX - morphologyScore,
    y: earY,
    z: earZ,
  };
  const { x, y, z } = position;
  const activeMaterial = isSelected ? highlightMaterial : earMaterial;

  const staticSurface = createAudioSurface({
    size: earSize,
    bend,
    radius: earSize,
    maxDeformation,
    verticalVariation,
  });

  return (
    <>
      <mesh
        position={[-x, y, z]}
        scale={[-earWidth, earHeight / bend, earDepth]}
        onClick={onClick}
        linguisticProperty="morphology"
        {...bind()}
      >
        <parametricGeometry args={[staticSurface, segments, segments]} />
        <shaderMaterial args={[activeMaterial]} />
      </mesh>
      <mesh
        position={[x, y, z]}
        scale={[earWidth, earHeight / bend, earDepth]}
        onClick={onClick}
        linguisticProperty="morphology"
        {...bind()}
      >
        <parametricGeometry args={[staticSurface, segments, segments]} />
        <shaderMaterial args={[activeMaterial]} />
      </mesh>
    </>
  );
};

export default MeshaEars;
