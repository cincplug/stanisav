import { useRef, useMemo } from "react";
import { Color } from "three";
import * as THREE from "three";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import linguisticConfig from "../../config/linguisticConfig.json";

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

  const getTonalityTexture = (tonality) => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const tonalityScore = linguisticConfig.tonality.values[tonality]?.score;

    // Use secondaryColor as background, colorObj as foreground
    ctx.fillStyle = `#${secondaryColor.getHexString()}`;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = `#${colorObj.getHexString()}`;
    ctx.lineWidth = 2;

    const numWaves = Math.floor(tonalityScore);
    ctx.beginPath();
    for (let x = 0; x <= size; x++) {
      let y = size / 2;
      for (let w = 0; w < numWaves; w++) {
        const frequency = (w + 1) * tonalityScore;
        const amplitude = (size * 0.375) / (w + 1);
        y += Math.sin((x * Math.PI * frequency) / (size / 4)) * amplitude;
      }
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    return canvas;
  };

  const tonalityTexture = useMemo(() => {
    if (!linguisticProperties?.tonality) return null;
    return getTonalityTexture(linguisticProperties.tonality);
  }, [linguisticProperties?.tonality, colorObj, secondaryColor]);

  const createTexture = (canvas) => {
    if (!canvas) return null;
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

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
        <meshStandardMaterial map={createTexture(tonalityTexture)} side={2} />
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
