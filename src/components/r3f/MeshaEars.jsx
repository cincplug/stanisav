import { extend } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { dragBindings } from "../../config/dragBindings.js";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useMeshaDrag } from "../../hooks/useMeshaDrag.js";
import { useHighlightMaterial } from "../../hooks/useShaderMaterial.js";
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
  const highlightMaterial = useHighlightMaterial(0);
  const { config } = useConfigContext();
  const { earHeight, earWidth, earDepth, maxDeformation, verticalVariation } =
    config;
  const bind = useMeshaDrag(dragBindings.ears, "morphology");

  const { x, y, z } = earPosition;
  const activeMaterial = isSelected ? highlightMaterial : earMaterial;

  const staticSurface = createAudioSurface({
    size,
    bend,
    radius: size,
    maxDeformation,
    verticalVariation,
  });

  return (
    <>
      <mesh
        position={[-x, y, z]}
        scale={[-earWidth, earHeight / segments, earDepth]}
        onClick={onClick}
        linguisticProperty="morphology"
        {...bind()}
      >
        <parametricGeometry args={[staticSurface, segments, segments]} />
        <shaderMaterial args={[activeMaterial]} />
      </mesh>
      <mesh
        position={[x, y, z]}
        scale={[earWidth, earHeight / segments, earDepth]}
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
