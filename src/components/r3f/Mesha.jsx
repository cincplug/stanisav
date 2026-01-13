import { useRef, useMemo } from "react";
import * as THREE from "three";
import { Color } from "three";
import { extend, useFrame } from "@react-three/fiber";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { useControls } from "../../contexts/ControlsContext.jsx";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";
import linguisticConfig from "../../config/linguisticConfig.json";
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

  const tonalityScore =
    linguisticConfig.tonality.values[linguisticProperties?.tonality]?.score;

  const { audioData } = useAudioAnimation(languageCode, isThisLanguageSelected);

  // Generate simple geometric textures based on typology
  const getTonalityTexture = (tonality, color) => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = `#${c1.getHexString()}`;
    ctx.lineWidth = 2;

    // Use score to determine wave complexity

    if (tonalityScore === 1) {
      // Non-tonal: straight horizontal lines
      for (let i = 16; i <= 48; i += 16) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(64, i);
        ctx.stroke();
      }
    } else {
      // Tonal: generate waves based on score
      // Score determines number of overlapping waves and frequency
      const numWaves = Math.floor(tonalityScore / 2);
      ctx.beginPath();
      for (let x = 0; x <= 64; x++) {
        let y = 32;
        // Add multiple sine waves based on complexity
        for (let w = 0; w < numWaves; w++) {
          const frequency = ((w + 1) * tonalityScore) / 4;
          const amplitude = 12 / (w + 1);
          y += Math.sin((x * Math.PI * frequency) / 16) * amplitude;
        }
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    return canvas;
  };

  const getMorphologyTexture = (morphology, color) => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = `#${c2.getHexString()}`;

    // Use score to determine morphological pattern complexity
    const score = linguisticConfig.morphology.values[morphology]?.score || 1;

    // Score determines number and overlap of blocks
    const numBlocks = Math.ceil(score * 1.5); // 1→2, 2.5→4, 3.2→5, 4→6
    const blockWidth = 64 / numBlocks;
    const overlap = (score - 1) / 3; // 0 to 1, determines overlap amount

    // Draw blocks with increasing overlap based on score
    for (let i = 0; i < numBlocks; i++) {
      const x = i * blockWidth * (1 - overlap * 0.3);
      const width = blockWidth * (1 + overlap * 0.2);
      const height = 16;
      const y = 24;

      if (overlap > 0.5) {
        // Fusional/Polysynthetic: add semi-transparent overlapping layer
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x + width * 0.2, y - 4, width * 0.8, height + 8);
        ctx.globalAlpha = 1.0;
      }

      ctx.fillRect(x, y, width * 0.9, height);
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
    // Use score directly to determine amplitude (score ranges from 1 to 4)
    const flexibility = linguisticProperties?.wordOrderFlexibility;
    const score =
      linguisticConfig.wordOrderFlexibility.values[flexibility]?.score || 1;
    return 1 + score * 0.5;
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
      let y = wordOrderAmplitude;

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
          symmetricalMirroring && u > 0.5
            ? harmonicsAmplifier
            : tonalityScore / 10;
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
