import { useRef, useMemo } from "react";
import { Color } from "three";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";

extend({ ParametricGeometry });

const MeshaMouth = ({
  color,
  audioReactiveSurface,
  segments,
  wordOrderAmplitude,
  labelSize,
  linguisticProperties,
  isThisLanguageSelected,
  audioData,
}) => {
  const teethSpheresRef = useRef([]);
  const c3 = new Color("#ffbbbb").sub(new Color(color));
  const c4 = new Color("#aaffaa").sub(new Color(color));

  const thickness = 0;

  // Generate teeth (phoneme spheres) in a circle below the mesh
  const teethSpheres = useMemo(() => {
    const count = linguisticProperties?.phonemeCount || 0;
    if (count === 0) return [];

    const radius = labelSize * 1.2;
    const spheres = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      spheres.push({ x, y: -3.5, z, angle, key: `tooth-${i}` });
    }
    return spheres;
  }, [linguisticProperties?.phonemeCount, labelSize]);

  useFrame(() => {
    // Update teeth Y position based on audio
    if (
      teethSpheresRef.current &&
      isThisLanguageSelected &&
      audioData.isActive
    ) {
      const { fundamentalData } = audioData;
      const count = teethSpheresRef.current.length;
      teethSpheresRef.current.forEach((sphere, i) => {
        if (sphere) {
          const angle = (i / count) * Math.PI * 2;
          const xSymmetry = Math.abs(Math.cos(angle));
          const maxBandIndex = Math.floor(fundamentalData.length / 6);
          const bandIndex = Math.floor(xSymmetry * maxBandIndex);
          const amplitude = fundamentalData[bandIndex] || 0;
          sphere.position.y = -7 + amplitude * 5.0;
          const scale = 0.5 + amplitude;
          sphere.scale.set(scale, scale * 2, scale / 2);
        }
      });
    }
  });

  return (
    <>
      {/* Third mesh with word order flexibility affecting amplitude */}
      <mesh
        position={[0, -1, -thickness]}
        scale={[-2, (-1 / 2) * wordOrderAmplitude, -2]}
        rotation={[0, 1, 0]}
      >
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color={c3} side={2} />
      </mesh>

      {/* Fourth mesh with word order flexibility affecting amplitude */}
      <mesh
        position={[0, -1, -thickness]}
        scale={[-2, (-1 / 2) * wordOrderAmplitude, -2]}
        rotation={[0, -1, 0]}
      >
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color={c4} side={2} />
      </mesh>

      {/* Teeth (phoneme count spheres) below meshes */}
      {teethSpheres.map((sphere, i) => (
        <mesh
          key={sphere.key}
          ref={(el) => (teethSpheresRef.current[i] = el)}
          position={[sphere.x, sphere.y, sphere.z]}
        >
          <sphereGeometry args={[0.4, 7, 8]} />
          <meshStandardMaterial
            color={c3}
            emissive={color}
            emissiveIntensity={0.9}
          />
        </mesh>
      ))}
    </>
  );
};

export default MeshaMouth;
