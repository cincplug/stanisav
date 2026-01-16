import { useRef, useMemo } from "react";
import { Color, MeshStandardMaterial } from "three";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";

import { useAppState } from "../../contexts/AppStateContext";
import linguisticConfig from "../../config/linguisticConfig.json";

extend({ ParametricGeometry });

const MeshaMouth = ({
  color,
  audioReactiveSurface,
  segments,
  wordOrderAmplitude,
  labelSize,
  languageCode,
  isThisLanguageSelected,
  audioData,
}) => {
  const { data } = useAppState();
  const linguisticProperties = data?.typologicalFeatures?.[languageCode];
  const teethSpheresRef = useRef([]);

  const teethSpheres = useMemo(() => {
    const count = linguisticProperties?.phonemeCount || 0;
    if (count === 0) return [];

    const radius = labelSize;
    const spheres = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
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
  const secondaryColor = useMemo(
    () => new Color("#ddddff").sub(colorObj),
    [colorObj]
  );

  const tonalityScore = useMemo(() => {
    const tonality = linguisticProperties?.tonality;
    return tonality
      ? linguisticConfig.tonality?.values?.[tonality]?.score || 1
      : 1;
  }, [linguisticProperties?.tonality]);

  const mouthMaterial = useMemo(() => {
    const mat = new MeshStandardMaterial({
      color: colorObj,
      side: 2,
    });
    return mat;
  }, [colorObj]);

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
            (xSymmetry * fundamentalData.length) / bandDivisor
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
        scale={[2 / 3, (-1 / 4) * wordOrderAmplitude, -2]}
        rotation={[-1 / 3, -Math.PI, 0]}
      >
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <primitive object={mouthMaterial} attach="material" />
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
