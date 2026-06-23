import { extend } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { RoundedBoxGeometry } from "three/examples/jsm/Addons.js";
import { dragBindings } from "../../config/dragBindings.js";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useEntranceContext } from "../../contexts/EntranceContext";
import { useAudioData } from "../../hooks/useAudioData.js";
import { useMeshaDrag } from "../../hooks/useMeshaDrag.js";
import { useHighlightMaterial } from "../../hooks/useShaderMaterial.js";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { shiftHue } from "../../utils/colorUtils";

extend({ RoundedBoxGeometry });

const MeshaTeeth = ({
  toothCount,
  consonantClusterSize,
  onClick,
  isSelected,
}) => {
  const teethRefs = useRef([]);
  const { audioData } = useAudioData();
  const { config } = useConfigContext();
  const { toothColor, emissiveness } = config.colors;
  const {
    toothSize,
    toothColorStep,
    toothWidth,
    toothLength,
    toothThickness,
    toothRoundness,
  } = config.mesha;
  const highlightMaterial = useHighlightMaterial(0, 2);
  const centerIndex = (toothCount - 1) / 2;

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
        z: Math.sin(angle) + consonantClusterSize / 2,
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
        }
      });
    }
  });

  if (!teeth.length) return null;

  const { revealedParts } = useEntranceContext();
  if (!revealedParts.has("teeth")) return null;

  return (
    <group position={[0, 1, 1]} scale={toothSize} {...bind()}>
      {teeth.map((tooth, i) => {
        const color = shiftHue(toothColor, toothColorStep * i);
        return (
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
              <roundedBoxGeometry
                args={[
                  toothWidth,
                  toothLength / (centerIndex + 1),
                  toothThickness * centerIndex,
                  6,
                  toothRoundness,
                ]}
              />
              {isSelected ? (
                <shaderMaterial args={[highlightMaterial]} />
              ) : (
                <meshPhongMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={emissiveness}
                  side={2}
                />
              )}
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default MeshaTeeth;
