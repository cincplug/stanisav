import { extend } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { dragBindings } from "../../config/dragBindings.js";
import { useControlsContext } from "../../contexts/ControlsContext.jsx";
import { useEntranceContext } from "../../contexts/EntranceContext";
import { useAudioData } from "../../hooks/useAudioData.js";
import { useMeshaDrag } from "../../hooks/useMeshaDrag.js";
import { useHighlightMaterial } from "../../hooks/useShaderMaterial.js";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { config } from "../../modules/configStore";
import { shiftHue } from "../../utils/colorUtils";
import { createToothShape } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

const MeshaTeeth = ({
  toothCount,
  consonantClusterSize,
  onClick,
  isSelected,
}) => {
  const teethRefs = useRef([]);
  const { controls } = useControlsContext();
  const { audioData } = useAudioData();
  const { teethSize } = controls;
  const { toothColor } = config.colors;
  const { toothColorStep } = config.meshaVisualization;
  const highlightMaterial = useHighlightMaterial(0, 2);

  const bind = useMeshaDrag(dragBindings.teeth, "phonemeCount");

  const teeth = useMemo(() => {
    if (toothCount === 0) return [];
    const arc = Math.PI * 1.5;
    const startAngle = Math.PI / 2 - arc / 2;

    return Array.from({ length: toothCount }, (_, toothIndex) => {
      const angle = startAngle + (toothIndex / toothCount) * arc;
      const positionInCluster = toothIndex % consonantClusterSize;
      const clusterCenter = (consonantClusterSize - 1) / 2;
      const rotationIntensity =
        consonantClusterSize > 1
          ? Math.abs(positionInCluster - clusterCenter) /
            Math.floor(consonantClusterSize / 2)
          : 0;
      const rotationAngle =
        Math.sign(positionInCluster - clusterCenter) * rotationIntensity;

      return {
        x: Math.cos(angle),
        y: 1,
        z: Math.sin(angle) + consonantClusterSize / 3,
        positionInCluster,
        rotationAngle,
        key: `tooth-${toothIndex}`,
      };
    });
  }, [toothCount, consonantClusterSize]);

  useThrottledFrame(() => {
    if (teethRefs.current) {
      const { harmonicsData } = audioData;
      const count = teethRefs.current.length;

      teethRefs.current.forEach((tooth, i) => {
        if (tooth) {
          const xSymmetry = Math.abs(Math.cos((i / count) * Math.PI * 2));
          const bandIndex = Math.floor((xSymmetry * harmonicsData.length) / 6);
          const amplitude = harmonicsData[bandIndex];
          tooth.position.y = -amplitude * 4;
          const scale = amplitude + consonantClusterSize / 5;
          tooth.scale.set(scale, scale * -1, scale / 4);
        }
      });
    }
  });

  if (!teeth.length) return null;

  const { revealedParts } = useEntranceContext();
  if (!revealedParts.has("teeth")) return null;

  return (
    <group position={[0, 1, 1]} scale={teethSize} {...bind()}>
      {teeth.map((tooth, i) => (
        <group
          key={tooth.key}
          position={[tooth.x, tooth.y, tooth.z - 1]}
          rotation={[tooth.rotationAngle, 0, 0]}
        >
          <mesh
            ref={(el) => (teethRefs.current[i] = el)}
            linguisticProperty="phonemeCount"
            onClick={onClick}
          >
            <parametricGeometry args={[createToothShape, 16, 8]} />
            {isSelected ? (
              <shaderMaterial args={[highlightMaterial]} />
            ) : (
              <meshPhongMaterial
                color={shiftHue(toothColor, toothColorStep * i)}
                side={2}
              />
            )}
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default MeshaTeeth;
