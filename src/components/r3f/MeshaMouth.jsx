import { useRef, useMemo } from "react";
import { Color } from "three";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { mouthFragmentShader, cheekVertexShader } from "../../shaders/shader";

import { useAppState } from "../../contexts/AppStateContext";
import linguisticConfig from "../../config/linguisticConfig.json";

extend({ ParametricGeometry });

const MeshaMouth = ({
  color,
  audioReactiveSurface,
  segments,
  labelSize,
  languageCode,
  isThisLanguageSelected,
  audioData,
  meshaYRotation,
}) => {
  const { data } = useAppState();
  const linguisticProperties = data?.typologicalFeatures?.[languageCode];
  const teethSpheresRef = useRef([]);

  const teethSpheres = useMemo(() => {
    const count = linguisticProperties?.phonemeCount || 0;
    if (count === 0) return [];

    const radius = labelSize;
    const arc = Math.PI * 1.5;
    const startAngle = Math.PI / 2 - arc / 2;
    const spheres = [];
    for (let i = 0; i < count; i++) {
      const angle = startAngle + (i / (count - 1)) * arc;
      spheres.push({
        x: Math.cos(angle) * radius,
        y: 1,
        z: Math.sin(angle) * radius,
        key: `tooth-${i}`,
      });
    }
    return spheres;
  }, [linguisticProperties?.phonemeCount, labelSize]);

  const colorObj = useMemo(() => new Color(color), [color]);

  const tonalityScore = useMemo(() => {
    const tonality = linguisticProperties?.tonality;
    return tonality
      ? linguisticConfig.tonality?.values?.[tonality]?.score || 1
      : 1;
  }, [linguisticProperties?.tonality]);

  // Map tonality string to shader type
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
      vertexShader: cheekVertexShader,
      fragmentShader: mouthFragmentShader,
      side: 2,
      transparent: false,
    };
  }, [colorObj, tonalityType]);

  useFrame(() => {
    if (
      teethSpheresRef.current &&
      isThisLanguageSelected &&
      audioData.isActive
    ) {
      const { fundamentalData } = audioData;
      const count = teethSpheresRef.current.length;
      const bandDivisor = 6;

      teethSpheresRef.current.forEach((sphere, i) => {
        if (sphere) {
          const angle = (i / count) * Math.PI * 2;
          const xSymmetry = Math.abs(Math.cos(angle));
          const bandIndex = Math.floor(
            (xSymmetry * fundamentalData.length) / bandDivisor,
          );
          const amplitude = fundamentalData[bandIndex] || 0;

          sphere.position.y = -amplitude * 5;
          const scale = amplitude * 2;
          sphere.scale.set(scale, scale * 2, scale / 2);
        }
      });
    }
  });

  return (
    <>
      <mesh
        position={[0, -1, 4]}
        scale={[2 / 3, -1 / 2, -2]}
        rotation={[-1 / 4 + meshaYRotation / 5, -Math.PI, 0]}
      >
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <shaderMaterial args={[mouthMaterial]} />
      </mesh>

      {teethSpheres.map((sphere, i) => (
        <mesh
          key={sphere.key}
          ref={(el) => (teethSpheresRef.current[i] = el)}
          position={[sphere.x, sphere.y, sphere.z]}
        >
          <sphereGeometry args={[0.4, 7, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
    </>
  );
};

export default MeshaMouth;
