import { extend } from "@react-three/fiber";
import { forwardRef, useMemo, useRef } from "react";
import { RoundedBoxGeometry } from "three/examples/jsm/Addons.js";
import { dragBindings } from "../../config/dragBindings.js";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useAudioData } from "../../hooks/useAudioData.js";
import { useMeshaDrag } from "../../hooks/useMeshaDrag.js";
import {
  useHighlightMaterial,
  useShaderMaterial,
} from "../../hooks/useShaderMaterial.js";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { shiftHue } from "../../utils/colorUtils";

extend({ RoundedBoxGeometry });

// Isolated tooth so each instance can call useShaderMaterial with its own color
const MeshaTooth = forwardRef(
  ({ tooth, centerIndex, color, isSelected, onClick }, ref) => {
    const { config } = useConfigContext();
    const { toothWidth, toothLength, toothThickness, toothRoundness } =
      config.mesha;
    const toothMaterial = useShaderMaterial(color);
    const highlightMaterial = useHighlightMaterial(0, 2);

    return (
      <group
        position={[tooth.x, tooth.y, tooth.z - 1]}
        rotation={[tooth.rotationAngle, 0, 0]}
      >
        <mesh ref={ref} linguisticProperty="phonemeCount" onClick={onClick}>
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
            <shaderMaterial args={[toothMaterial]} />
          )}
        </mesh>
      </group>
    );
  },
);

const MeshaTeeth = ({
  toothCount,
  consonantClusterSize,
  onClick,
  isSelected,
}) => {
  const teethRefs = useRef([]);
  const { audioData } = useAudioData();
  const { config } = useConfigContext();
  const { toothColor } = config.colors;
  const { toothSize, toothColorStep } = config.mesha;
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

  return (
    <group position={[0, 1, 1]} scale={toothSize} {...bind()}>
      {teeth.map((tooth, i) => (
        <MeshaTooth
          key={tooth.key}
          ref={(el) => (teethRefs.current[i] = el)}
          tooth={tooth}
          centerIndex={centerIndex}
          color={shiftHue(toothColor, toothColorStep * i)}
          isSelected={isSelected}
          onClick={onClick}
        />
      ))}
    </group>
  );
};

export default MeshaTeeth;
