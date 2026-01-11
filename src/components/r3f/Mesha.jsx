import { useRef, useMemo } from "react";
import * as THREE from "three";
import { Color } from "three";
import { extend, useFrame } from "@react-three/fiber";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { useControls } from "../../contexts/ControlsContext.jsx";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";
import MeshaEye from "./MeshaEye.jsx";

extend({ ParametricGeometry });

const Mesha = ({ color, labelSize, languageCode, linguisticProperties }) => {
  const groupRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const mesh1Ref = useRef();
  const mesh2Ref = useRef();
  const phonemeSpheresRef = useRef([]);
  const caseConesRef = useRef([]);
  const { selectedLanguage } = useLanguageSelection();
  const isThisLanguageSelected = selectedLanguage === languageCode;
  const { controls } = useControls();
  const { eyeYOffset, eyeXPosition, eyeZPositionMultiplier } = controls;

  const c1 = new Color(color);
  const c2 = new Color("#ddddff").sub(c1);
  const c3 = new Color("#ffbbbb").sub(c1);
  const c4 = new Color("#aaffaa").sub(c1);

  const [xx, yy, zz] = languageCode
    .toLowerCase()
    .split("")
    .map((c) => (c.charCodeAt(0) - 100) / 10 + 1);

  const { audioData } = useAudioAnimation(languageCode, isThisLanguageSelected);

  // Generate simple geometric textures based on typology
  const getTonalityTexture = (tonality, color) => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // Different wave patterns representing tonal complexity
    switch (tonality) {
      case "non-tonal":
        // Straight horizontal lines (no pitch variation)
        for (let i = 16; i <= 48; i += 16) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(64, i);
          ctx.stroke();
        }
        break;
      case "pitch-accent":
        // Single accent mark pattern
        for (let i = 0; i < 64; i += 16) {
          ctx.beginPath();
          ctx.moveTo(i, 48);
          ctx.lineTo(i + 8, 32);
          ctx.lineTo(i + 16, 48);
          ctx.stroke();
        }
        break;
      case "simple-tonal":
        // Simple wave pattern (low frequency)
        ctx.beginPath();
        for (let x = 0; x <= 64; x++) {
          const y = 32 + Math.sin((x * Math.PI) / 16) * 12;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        break;
      case "complex-tonal":
        // Complex overlapping waves (high frequency)
        ctx.beginPath();
        for (let x = 0; x <= 64; x++) {
          const y =
            32 +
            Math.sin((x * Math.PI) / 8) * 8 +
            Math.sin((x * Math.PI) / 4) * 6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        break;
    }
    return canvas;
  };

  const getMorphologyTexture = (morphology, color) => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = color;

    // Different patterns representing morphological complexity
    switch (morphology) {
      case "isolating":
        // Separate blocks (one morpheme per word)
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(i * 20 + 4, 24, 12, 16);
        }
        break;
      case "agglutinative":
        // Connected blocks in sequence
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(i * 16, 24, 14, 16);
        }
        break;
      case "fusional":
        // Overlapping/merged shapes
        ctx.fillRect(8, 24, 16, 16);
        ctx.fillRect(20, 24, 16, 16);
        ctx.fillRect(32, 24, 16, 16);
        ctx.globalAlpha = 0.5;
        ctx.fillRect(14, 20, 16, 24);
        ctx.fillRect(26, 20, 16, 24);
        break;
      case "polysynthetic":
        // Dense grid pattern (complex words)
        for (let x = 0; x < 64; x += 8) {
          for (let y = 0; y < 64; y += 8) {
            ctx.fillRect(x + 1, y + 1, 5, 5);
          }
        }
        break;
    }
    return canvas;
  };

  const tonalityTexture = useMemo(() => {
    if (!linguisticProperties?.tonality) return null;
    return getTonalityTexture(
      linguisticProperties.tonality,
      `#${c2.getHexString()}`
    );
  }, [linguisticProperties?.tonality, c2]);

  const morphologyTexture = useMemo(() => {
    if (!linguisticProperties?.morphology) return null;
    return getMorphologyTexture(
      linguisticProperties.morphology,
      `#${c1.getHexString()}`
    );
  }, [linguisticProperties?.morphology, c1]);

  // Get word order flexibility amplitude multiplier
  const wordOrderAmplitude = useMemo(() => {
    const flexibility = linguisticProperties?.wordOrderFlexibility;
    switch (flexibility) {
      case "rigid":
        return 0.5;
      case "semi-flexible":
        return 0.75;
      case "flexible":
        return 1.0;
      case "very-flexible":
        return 1.25;
      default:
        return 1.0;
    }
  }, [linguisticProperties?.wordOrderFlexibility]);

  const createAudioReactiveSurface = (
    labelSize,
    isSelectedForAudio,
    audioDataValue,
    meshConfig
  ) => {
    const {
      frequencyBands,
      maxDeformation,
      fundamentalAmplifier,
      harmonicsAmplifier,
      verticalVariationMultiplier,
      symmetricalMirroring,
    } = meshConfig;

    return (u, v, target) => {
      const size = labelSize;
      const z = (u - 0.5) * size;
      const x = (v - 0.5) * size;
      let y = yy;

      if (isSelectedForAudio && audioDataValue.isActive) {
        const { fundamentalData, harmonicsData } = audioDataValue;
        const verticalVariation =
          Math.sin(v * Math.PI * 2) * verticalVariationMultiplier;

        const uForBand = symmetricalMirroring && u > 0.5 ? 1 - u : u;
        const bandIndex = Math.floor(uForBand * (frequencyBands - 1));

        const fundamentalAmplitude = fundamentalData[bandIndex] || 0;
        const harmonicsAmplitude = harmonicsData[bandIndex] || 0;

        const balancedFundamental = fundamentalAmplitude * fundamentalAmplifier;
        const harmonicsModifier =
          symmetricalMirroring && u > 0.5 ? harmonicsAmplifier : zz;
        const balancedHarmonics = harmonicsAmplitude * harmonicsModifier;
        const totalAmplitude = balancedFundamental + balancedHarmonics;

        y = totalAmplitude * maxDeformation * size;

        if (symmetricalMirroring && u > 0.5) {
          y *= 1 + verticalVariation;
        }
      }

      target.set(x, y, z);
    };
  };

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }

    // Calculate average Y position from the two meshes
    if (
      mesh1Ref.current &&
      mesh2Ref.current &&
      leftEyeRef.current &&
      rightEyeRef.current
    ) {
      const geometry1 = mesh1Ref.current.geometry;
      const geometry2 = mesh2Ref.current.geometry;

      if (geometry1 && geometry2) {
        geometry1.computeBoundingBox();
        geometry2.computeBoundingBox();

        const maxY1 = geometry1.boundingBox.max.y * mesh1Ref.current.scale.y;
        const maxY2 = geometry2.boundingBox.max.y * mesh2Ref.current.scale.y;
        const avgY = (maxY1 + maxY2) / 2 + eyeYOffset;

        leftEyeRef.current.position.y = avgY;
        rightEyeRef.current.position.y = avgY;
      }
    }

    // Update phoneme spheres Y position based on audio (similar to eyes)
    if (
      phonemeSpheresRef.current &&
      isThisLanguageSelected &&
      audioData.isActive
    ) {
      const { fundamentalData } = audioData;
      const count = phonemeSpheresRef.current.length;
      phonemeSpheresRef.current.forEach((sphere, i) => {
        if (sphere) {
          // Calculate angle for this sphere
          const angle = (i / count) * Math.PI * 2;
          // Use absolute x-coordinate for symmetry: items with same |x| get same band
          // |cos(angle)| ranges from 0 (front/back) to 1 (left/right)
          const xSymmetry = Math.abs(Math.cos(angle));
          // Focus on lower frequency range (bass, guitar, voice) - use only first sixth of spectrum
          const maxBandIndex = Math.floor(fundamentalData.length / 6);
          const bandIndex = Math.floor(xSymmetry * maxBandIndex);
          const amplitude = fundamentalData[bandIndex] || 0;
          sphere.position.y = -7 + amplitude * 5.0;
          // Scale based on amplitude: base size + amplitude-based growth
          const scale = 0.5 + amplitude;
          sphere.scale.set(scale, scale * 2, scale / 2);
        }
      });
    }

    // Update case cones Y position based on audio
    if (caseConesRef.current && isThisLanguageSelected && audioData.isActive) {
      const { harmonicsData } = audioData;
      const count = caseConesRef.current.length;
      caseConesRef.current.forEach((cone, i) => {
        if (cone) {
          // Calculate angle for this cone
          const angle = (i / count) * Math.PI * 2;
          // Use absolute x-coordinate for symmetry
          const xSymmetry = Math.abs(Math.cos(angle));
          // Focus on lower frequency range for harmonics as well
          const maxBandIndex = Math.floor(harmonicsData.length / 6);
          const bandIndex = Math.floor(xSymmetry * maxBandIndex);
          const amplitude = harmonicsData[bandIndex] || 0;
          cone.position.y = 3.5 + amplitude * 5.0;
          // Scale based on amplitude: base size + amplitude-based growth
          const scale = 0.5 + amplitude * 2.0;
          cone.scale.set(scale, scale, scale);
        }
      });
    }
  });

  const audioReactiveSurface = useMemo(
    () =>
      createAudioReactiveSurface(
        labelSize,
        isThisLanguageSelected,
        audioData,
        audioVisualizationConfig.meshDeformation
      ),
    [labelSize, isThisLanguageSelected, audioData]
  );

  const segments = audioVisualizationConfig.meshDeformation.meshSegments;
  const thickness = 0;

  // Generate phoneme spheres in a circle below the mesh
  const phonemeSpheres = useMemo(() => {
    const count = linguisticProperties?.phonemeCount || 0;
    if (count === 0) return [];

    const radius = labelSize * 1.2;
    const spheres = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      spheres.push({ x, y: -3.5, z, angle, key: `phoneme-${i}` });
    }
    return spheres;
  }, [linguisticProperties?.phonemeCount, labelSize]);

  // Generate case cones in a circle above the mesh
  const caseCones = useMemo(() => {
    const count = linguisticProperties?.caseCount || 0;
    if (count === 0) return [];

    const radius = labelSize * 0.95;
    const cones = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = (Math.cos(angle) * radius) / 2;
      const z = Math.sin(angle) * radius;
      cones.push({ x, y: 3.5, z, angle, key: `case-${i}` });
    }
    return cones;
  }, [linguisticProperties?.caseCount, labelSize]);

  return (
    <group ref={groupRef}>
      {/* First mesh with tonality texture */}
      <mesh
        ref={mesh1Ref}
        position={[1, 1, thickness]}
        scale={[1 / 2, 2 / 3, 3]}
        rotation={[0, 1 / 20, 0]}
      >
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial
          color={c1}
          side={2}
          map={
            tonalityTexture
              ? (() => {
                  const texture = new THREE.CanvasTexture(tonalityTexture);
                  texture.needsUpdate = true;
                  return texture;
                })()
              : null
          }
        />
      </mesh>

      {/* Second mesh with morphology texture */}
      <mesh
        ref={mesh2Ref}
        position={[-1, 1, thickness]}
        scale={[-1 / 2, 3 / 4, 3]}
        rotation={[0, -1 / 20, 0]}
      >
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial
          color={c2}
          side={2}
          map={
            morphologyTexture
              ? (() => {
                  const texture = new THREE.CanvasTexture(morphologyTexture);
                  texture.needsUpdate = true;
                  return texture;
                })()
              : null
          }
        />
      </mesh>

      <group
        ref={leftEyeRef}
        position={[
          eyeXPosition,
          1,
          thickness + labelSize * eyeZPositionMultiplier,
        ]}
      >
        <MeshaEye position={[0, 0, 0]} color={color} labelSize={labelSize} />
      </group>

      <group
        ref={rightEyeRef}
        position={[
          -eyeXPosition,
          1,
          thickness + labelSize * eyeZPositionMultiplier,
        ]}
      >
        <MeshaEye position={[0, 0, 0]} color={color} labelSize={labelSize} />
      </group>

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

      {/* Phoneme count spheres below meshes */}
      {phonemeSpheres.map((sphere, i) => (
        <mesh
          key={sphere.key}
          ref={(el) => (phonemeSpheresRef.current[i] = el)}
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

      {/* Case count cones above meshes */}
      {caseCones.map((cone, i) => (
        <mesh
          key={cone.key}
          ref={(el) => (caseConesRef.current[i] = el)}
          position={[cone.x, cone.y, cone.z]}
          rotation={[0, 0, 0]}
        >
          <coneGeometry args={[0.5, 1.5, 6]} />
          <meshStandardMaterial
            color={c3}
            emissive={c3}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};

export default Mesha;
