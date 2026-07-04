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

const MeshaTeeth = ({
  toothCount,
  consonantClusterSize,
  onClick,
  isSelected,
}) => {
  const teethRefs = useRef([]);
  const { audioData } = useAudioData();
  const { config } = useConfigContext();
  const {
    toothSpacing,
    toothColor,
    toothSize,
    toothColorStep,
    toothY,
    toothZ,
    toothSpin,
  } = config;
  const centerIndex = (toothCount - 1) / 2;

  const bind = useMeshaDrag(dragBindings.teeth, "phonemeCount");

  const teeth = useMemo(() => {
    if (toothCount === 0) return [];
    const arc = Math.PI;
    const startAngle = Math.PI / 2 - arc / 2;
    const halfCount = (toothCount - 1) / 2;
    const radius = toothCount * toothSpacing;

    return Array.from({ length: toothCount }, (_, toothIndex) => {
      const angle = startAngle + (toothIndex / (toothCount - 1)) * arc;
      const indexFromCenter = Math.abs(toothIndex - halfCount);

      return {
        x: Math.cos(angle) * radius,
        y: 0,
        z: Math.sin(angle) * radius,
        indexFromCenter,
        halfCount,
        rotationAngle: 0,
        key: `tooth-${toothIndex}`,
      };
    });
  }, [toothCount, toothSpacing]);

  useThrottledFrame(() => {
    if (teethRefs.current) {
      const { harmonicsData } = audioData;
      const count = teethRefs.current.length;

      teethRefs.current.forEach((tooth, i) => {
        if (tooth) {
          const xSymmetry = Math.abs(Math.cos((i / count) * Math.PI * 2));
          const bandIndex = Math.floor((xSymmetry * harmonicsData.length) / 6);
          const amplitude = harmonicsData[bandIndex];
          tooth.rotation.x = amplitude * consonantClusterSize * toothSpin;
        }
      });
    }
  });

  if (!teeth.length) return null;

  return (
    <group position={[0, toothY, toothZ]} scale={toothSize} {...bind()}>
      {teeth.map((tooth, i) => {
        return (
          <MeshaTooth
            key={tooth.key}
            ref={(el) => (teethRefs.current[i] = el)}
            tooth={tooth}
            index={i}
            centerIndex={centerIndex}
            color={shiftHue(toothColor, toothColorStep * i)}
            isSelected={isSelected}
            onClick={onClick}
          />
        );
      })}
    </group>
  );
};

const MeshaTooth = forwardRef(({ tooth, color, isSelected, onClick }, ref) => {
  const { config } = useConfigContext();
  const {
    toothWidth,
    toothLengthCentral,
    toothThicknessCentral,
    toothLengthCorner,
    toothThicknessCorner,
  } = config;
  const { indexFromCenter, halfCount } = tooth;

  const toothMaterial = useShaderMaterial(color);
  const highlightMaterial = useHighlightMaterial(0, 2);

  const ratio = halfCount > 0 ? indexFromCenter / halfCount : 0;
  const length =
    toothLengthCentral + (toothLengthCorner - toothLengthCentral) * ratio;
  const thickness =
    toothThicknessCentral +
    (toothThicknessCorner - toothThicknessCentral) * ratio;
  const roundness = thickness / 2;

  return (
    <group
      position={[tooth.x, tooth.y, tooth.z - 1]}
      rotation={[tooth.rotationAngle, 0, 0]}
    >
      <mesh ref={ref} linguisticProperty="phonemeCount" onClick={onClick}>
        <roundedBoxGeometry
          args={[toothWidth, length, thickness, 6, roundness]}
        />
        {isSelected ? (
          <shaderMaterial args={[highlightMaterial]} />
        ) : (
          <shaderMaterial args={[toothMaterial]} />
        )}
      </mesh>
    </group>
  );
});

export default MeshaTeeth;
