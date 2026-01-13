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

  // Create a unified mouth surface that combines the characteristics of both original meshes
  const createUnifiedMouthSurface = () => {
    return (u, v, target) => {
      // Get the base surface
      audioReactiveSurface(u, v, target);
    };
  };

  const unifiedMouthSurface = useMemo(
    () => createUnifiedMouthSurface(),
    [audioReactiveSurface]
  );

  // Calculate averaged position, scale, and rotation
  const avgPosition = [0, -1, 4];
  const avgScale = [2 / 3, (-1 / 4) * wordOrderAmplitude, -2];
  const avgRotation = [-1 / 3, -Math.PI, 0];

  // Generate teeth (phoneme spheres) in a circle below the mesh
  const teethSpheres = useMemo(() => {
    const count = linguisticProperties?.phonemeCount || 0;
    if (count === 0) return [];

    const radius = labelSize;
    const spheres = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      spheres.push({ x, y: 1, z, angle, key: `tooth-${i}` });
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
          sphere.position.y = -amplitude * 5.0;
          const scale = amplitude * 2;
          sphere.scale.set(scale, scale * 2, scale / 2);
        }
      });
    }
  });

  return (
    <>
      {/* Unified mouth mesh */}
      <mesh position={avgPosition} scale={avgScale} rotation={avgRotation}>
        <parametricGeometry args={[unifiedMouthSurface, segments, segments]} />
        <meshStandardMaterial color={c3} side={2} vertexColors={false} />
      </mesh>

      {/* Teeth (phoneme count spheres) below meshes */}
      {teethSpheres.map((sphere, i) => (
        <mesh
          key={sphere.key}
          ref={(el) => (teethSpheresRef.current[i] = el)}
          position={[sphere.x, sphere.y, sphere.z]}
        >
          <sphereGeometry args={[0.4, 7, 8]} />
          <meshStandardMaterial color={"#ffffff"} />
        </mesh>
      ))}
    </>
  );
};

export default MeshaMouth;
