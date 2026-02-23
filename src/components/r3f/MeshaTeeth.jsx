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

const MeshaTeeth = ({ toothCount }) => {
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
    const count = toothCount;
    if (count === 0) return [];

    const radius = meshaSize;
    const arc = Math.PI * 1.5;
    const startAngle = Math.PI / 2 - arc / 2;
    const teethArr = [];

    for (let i = 0; i < count; i++) {
      const angle = startAngle + (i / count) * arc;
      teethArr.push({
        x: Math.cos(angle) * radius,
        y: 4 * meshaSize,
        z: Math.sin(angle) * radius,
        key: `tooth-${i}`,
      });
    }
    return teethArr;
  }, [toothCount, meshaSize]);

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
        <mesh
          key={tooth.key}
          ref={(el) => (teethRefs.current[i] = el)}
          position={[tooth.x, tooth.y, tooth.z]}
        >
          <parametricGeometry args={[toothShape, 16, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
};

export default MeshaTeeth;
