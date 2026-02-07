import { useRef, useMemo } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAppState } from "../../contexts/AppStateContext";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { tonalityVertexShader } from "../../shaders/shader.js";

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

export const useMouthMaterial = (color, languageCode) => {
  const { data } = useAppState();
  const linguisticProperties = data?.typologicalFeatures?.[languageCode];

  const colorObj = useMemo(() => new Color(color), [color]);

  const tonalityType = useMemo(() => {
    const tonality = linguisticProperties?.tonality;
    if (tonality === "non-tonal") return 0;
    if (tonality === "pitch-accent") return 1;
    if (tonality === "simple-tonal") return 2;
    if (tonality === "complex-tonal") return 3;
    return 0;
  }, [linguisticProperties?.tonality]);

  const mouthMaterial = useMemo(() => {
    return {
      uniforms: {
        uBaseColor: { value: colorObj },
        uTonalityType: { value: tonalityType },
      },
      vertexShader: tonalityVertexShader,
      fragmentShader: mouthFragmentShader,
      side: 2,
      transparent: false,
    };
  }, [colorObj, tonalityType]);

  return mouthMaterial;
};

const MeshaMouth = ({
  mouthMaterial,
  audioReactiveSurface,
  segments,
  languageCode,
  audioData,
}) => {
  const { controls } = useControls();
  const meshaSize = controls.meshaSize;
  const { data } = useAppState();
  const linguisticProperties = data?.typologicalFeatures?.[languageCode];
  const teethRefs = useRef([]);

  const teeth = useMemo(() => {
    const count = linguisticProperties?.phonemeCount;
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
  }, [linguisticProperties?.phonemeCount, meshaSize]);

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
          const amplitude = fundamentalData[bandIndex] || 0;

          tooth.position.y = -amplitude * 3;
          const scale = amplitude * 2;
          tooth.scale.set(scale, scale * -1, scale / 4);
        }
      });
    }
  });

  return (
    <>
      <group
        position={[0, meshaSize * 1.5, meshaSize * 0.7]}
        scale={[1 / 2, 1 / 2, 1 / 2]}
      >
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
      <mesh
        position={[0, meshaSize * 2, meshaSize]}
        scale={[meshaSize / 2, -meshaSize / 4, -meshaSize / 2]}
        rotation={[1 / 4, Math.PI, 0]}
      >
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <shaderMaterial args={[mouthMaterial]} />
      </mesh>
    </>
  );
};

export default MeshaMouth;
