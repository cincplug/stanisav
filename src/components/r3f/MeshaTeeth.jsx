import { useRef, useMemo } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { defaultAudioData } from "../../config/meshaDefaultAudioData.js";

extend({ ParametricGeometry });

function toothShape(u, v, target) {
  const angle = u * Math.PI * 2;
  const baseRadius = 0.3;
  const topRadius = 0.4;
  const r = baseRadius + (topRadius - baseRadius) * v;

  const shapeTop = 0.1;
  const shapeBottom = 0.8;
  const shapeFactor = shapeTop + (shapeBottom - shapeTop) * v;

  const roundTop = 1 - Math.pow(1 - v, 2);
  const blendFactor = shapeFactor * roundTop + shapeTop * (1 - roundTop);

  const x =
    Math.sign(Math.cos(angle)) *
    Math.pow(Math.abs(Math.cos(angle)), blendFactor) *
    r;
  const z =
    Math.sign(Math.sin(angle)) *
    Math.pow(Math.abs(Math.sin(angle)), blendFactor) *
    r;
  const y = (0.5 - v) * 0.8;

  target.set(x, y, z);
}

const MeshaTeeth = ({ toothCount, clusterSize }) => {
  const teethRefs = useRef([]);
  const lastAudioDataRef = useRef(defaultAudioData);

  const { controls } = useControls();
  const { audioData: rawAudioData } = useAudioAnimation();
  const { meshaSize, teethSize } = controls;

  const audioData = rawAudioData.isActive
    ? rawAudioData
    : lastAudioDataRef.current;

  if (rawAudioData.isActive) {
    lastAudioDataRef.current = rawAudioData;
  }

  const teeth = useMemo(() => {
    if (toothCount === 0) return [];

    const radius = meshaSize;
    const arc = Math.PI * 1.5;
    const startAngle = Math.PI / 2 - arc / 2;
    const effectiveClusterSize = clusterSize || toothCount;

    return Array.from({ length: toothCount }, (_, toothIndex) => {
      const angle = startAngle + (toothIndex / toothCount) * arc;
      const positionInCluster = toothIndex % effectiveClusterSize;
      const clusterNumber = Math.floor(toothIndex / effectiveClusterSize);

      // Symmetric rotation within cluster: center tooth has 0 rotation
      const clusterCenter = (effectiveClusterSize - 1) / 2;
      const distanceFromClusterCenter = Math.abs(
        positionInCluster - clusterCenter,
      );
      const maxDistanceFromCenter = Math.floor(effectiveClusterSize / 2);
      const rotationIntensity =
        maxDistanceFromCenter > 0
          ? distanceFromClusterCenter / maxDistanceFromCenter
          : 0;

      // Rotation direction: left side negative, right side positive
      const rotationDirection =
        positionInCluster < clusterCenter
          ? -1
          : positionInCluster > clusterCenter
            ? 1
            : 0;
      const rotationAngle =
        rotationDirection * rotationIntensity * (Math.PI / 12);

      return {
        x: Math.cos(angle) * radius,
        y: -0.5,
        z: Math.sin(angle) * radius,
        positionInCluster,
        clusterNumber,
        rotationAngle,
        key: `tooth-${toothIndex}`,
      };
    });
  }, [toothCount, clusterSize]);

  useFrame(() => {
    if (teethRefs.current && audioData.isActive) {
      const { fundamentalData } = audioData;
      const count = teethRefs.current.length;
      const bandDivisor = 6;

      teethRefs.current.forEach((tooth, i) => {
        if (tooth) {
          const angle = (i / count) * Math.PI * 2;
          const xSymmetry = Math.abs(Math.cos(angle));
          const bandIndex = Math.floor(
            (xSymmetry * fundamentalData.length) / bandDivisor,
          );
          const amplitude = fundamentalData[bandIndex];

          tooth.position.y = -amplitude * 3;
          const scale = amplitude * 2;
          tooth.scale.set(scale, scale * -1, scale / 4);
        }
      });
    }
  });

  if (!teeth.length) return null;

  return (
    <group position={[0, meshaSize, meshaSize * 0.7]} scale={teethSize}>
      {teeth.map((tooth, i) => (
        <group
          key={tooth.key}
          position={[tooth.x, tooth.y, tooth.z]}
          rotation={[0, 0, tooth.rotationAngle]}
        >
          <mesh ref={(el) => (teethRefs.current[i] = el)} position={[0, 0, 0]}>
            <parametricGeometry args={[toothShape, 16, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default MeshaTeeth;
