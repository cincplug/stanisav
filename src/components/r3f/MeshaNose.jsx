import { useRef } from "react";
import { dragBindings } from "../../config/dragBindings.js";
import { useControlsContext } from "../../contexts/ControlsContext.jsx";
import { useEntranceContext } from "../../contexts/EntranceContext";
import { useMeshaDrag } from "../../hooks/useMeshaDrag.js";
import { useHighlightMaterial } from "../../hooks/useShaderMaterial.js";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { config } from "../../modules/configStore";

const MeshaNose = ({
  position,
  scale,
  segmentColors,
  onClick,
  isSelectedOuter,
  isSelectedInner,
}) => {
  const groupRef = useRef();
  const segmentARef = useRef();
  const segmentBRef = useRef();
  const segmentCRef = useRef();
  const { controls } = useControlsContext();
  const { pupilSize } = controls;
  const highlightMaterial = useHighlightMaterial(0, 2);

  const { segments } = config.meshaVisualization;

  const bind = useMeshaDrag(dragBindings.nose);

  useThrottledFrame(({ camera }) => {
    if (!groupRef.current) return;
    groupRef.current.lookAt(camera.position);
  });

  const { revealedParts } = useEntranceContext();
  if (!revealedParts.has("nose")) return null;

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      renderOrder={2}
      {...bind()}
    >
      <mesh
        ref={segmentARef}
        scale={1}
        linguisticProperty="wordOrder"
        onClick={onClick}
      >
        <sphereGeometry
          args={[pupilSize, segments, segments, -Math.PI, Math.PI]}
        />
        {isSelectedOuter ? (
          <shaderMaterial args={[highlightMaterial]} />
        ) : (
          <meshBasicMaterial
            wireframe={true}
            color={segmentColors[0]}
            side={2}
            depthTest={false}
            transparent={true}
          />
        )}
      </mesh>

      <mesh
        ref={segmentBRef}
        scale={0.8}
        linguisticProperty="wordOrderFlexibility"
        onClick={onClick}
      >
        <sphereGeometry
          args={[pupilSize, segments, segments, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        {isSelectedInner ? (
          <shaderMaterial args={[highlightMaterial]} />
        ) : (
          <meshBasicMaterial
            wireframe={true}
            color={segmentColors[1]}
            side={2}
            depthTest={false}
            transparent={true}
          />
        )}
      </mesh>

      <mesh ref={segmentCRef} scale={0.6} linguisticProperty="noseInner">
        <sphereGeometry
          args={[pupilSize, segments, segments, 0, Math.PI * 2, 0, Math.PI]}
        />
        {isSelectedInner ? (
          <shaderMaterial args={[highlightMaterial]} />
        ) : (
          <meshBasicMaterial
            wireframe={true}
            color={segmentColors[2]}
            side={2}
            depthTest={false}
            transparent={true}
          />
        )}
      </mesh>
    </group>
  );
};

export default MeshaNose;
