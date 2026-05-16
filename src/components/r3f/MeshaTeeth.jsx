import { useRef, useMemo } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAudioData } from "../../hooks/useAudioData.js";
import { useHighlightMaterial } from "../../hooks/useShaderMaterial.js";
import { createToothShape } from "../../utils/shapeUtils.js";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";

extend({ ParametricGeometry });

const MeshaTeeth = ({ toothCount, clusterSize, onClick, isSelected }) => {
  const teethRefs = useRef([]);
  const { controls } = useControls();
  const { audioData } = useAudioData();
  const { teethSize } = controls;
  const highlightMaterial = useHighlightMaterial(0, 2);

  const teeth = useMemo(() => {
    if (toothCount === 0) return [];
    const arc = Math.PI * 1.5;
    const startAngle = Math.PI / 2 - arc / 2;

    return Array.from({ length: toothCount }, (_, toothIndex) => {
      const angle = startAngle + (toothIndex / toothCount) * arc;
      const positionInCluster = toothIndex % clusterSize;
      const clusterCenter = (clusterSize - 1) / 2;
      const rotationIntensity =
        clusterSize > 1
          ? Math.abs(positionInCluster - clusterCenter) /
            Math.floor(clusterSize / 2)
          : 0;
      const rotationAngle =
        Math.sign(positionInCluster - clusterCenter) * rotationIntensity;

      return {
        x: Math.cos(angle),
        y: 1,
        z: Math.sin(angle) + clusterSize / 3,
        positionInCluster,
        rotationAngle,
        key: `tooth-${toothIndex}`,
      };
    });
  }, [toothCount, clusterSize]);

  const deltaAccRef = useRef(0);

  useFrame((_, delta) => {
    deltaAccRef.current += delta * 1000;
    if (deltaAccRef.current < audioVisualizationConfig.meshDeformation.timeRate)
      return;
    deltaAccRef.current -= audioVisualizationConfig.meshDeformation.timeRate;

    if (teethRefs.current) {
      const { harmonicsData } = audioData;
      const count = teethRefs.current.length;

      teethRefs.current.forEach((tooth, i) => {
        if (tooth) {
          const xSymmetry = Math.abs(Math.cos((i / count) * Math.PI * 2));
          const bandIndex = Math.floor((xSymmetry * harmonicsData.length) / 6);
          const amplitude = harmonicsData[bandIndex];
          tooth.position.y = -amplitude * 4;
          const scale = amplitude + clusterSize / 5;
          tooth.scale.set(scale, scale * -1, scale / 4);
        }
      });
    }
  });

  if (!teeth.length) return null;

  return (
    <group position={[0, 1, 1]} scale={teethSize}>
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
              <meshStandardMaterial color="#e7ebef" />
            )}
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default MeshaTeeth;
