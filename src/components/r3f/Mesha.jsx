import { useRef, useMemo } from "react";
import { Color } from "three";
import { extend, useFrame } from "@react-three/fiber";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { useControls } from "../../contexts/ControlsContext.jsx";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";
import linguisticConfig from "../../config/linguisticConfig.json";
import MeshaEye from "./MeshaEye.jsx";
import MeshaCheek from "./MeshaCheek.jsx";
import MeshaMouth from "./MeshaMouth.jsx";

extend({ ParametricGeometry });

const Mesha = ({ color, labelSize, languageCode, linguisticProperties }) => {
  const groupRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const meshaCheekRef = useRef();
  const caseConesRef = useRef([]);
  const { selectedLanguage } = useLanguageSelection();
  const isThisLanguageSelected = selectedLanguage === languageCode;
  const { controls } = useControls();
  const { eyeYOffset, eyeXPosition, eyeZPositionMultiplier } = controls;

  const c3 = new Color("#ffbbbb").sub(new Color(color));

  const tonalityScore =
    linguisticConfig.tonality.values[linguisticProperties?.tonality]?.score;

  const { audioData } = useAudioAnimation(languageCode, isThisLanguageSelected);

  // Get word order flexibility amplitude multiplier
  const wordOrderAmplitude = useMemo(() => {
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

    // Calculate average Y position from the two meshes in MeshaCheek
    if (
      meshaCheekRef.current?.mesh1 &&
      meshaCheekRef.current?.mesh2 &&
      leftEyeRef.current &&
      rightEyeRef.current
    ) {
      const mesh1 = meshaCheekRef.current.mesh1;
      const mesh2 = meshaCheekRef.current.mesh2;
      const geometry1 = mesh1.geometry;
      const geometry2 = mesh2.geometry;

      if (geometry1 && geometry2) {
        geometry1.computeBoundingBox();
        geometry2.computeBoundingBox();

        const maxY1 = geometry1.boundingBox.max.y * mesh1.scale.y;
        const maxY2 = geometry2.boundingBox.max.y * mesh2.scale.y;
        const avgY = (maxY1 + maxY2) / 2 + eyeYOffset;

        leftEyeRef.current.position.y = avgY;
        rightEyeRef.current.position.y = avgY;
      }
    }

    // Update case cones Y position based on audio
    if (caseConesRef.current && isThisLanguageSelected && audioData.isActive) {
      const { harmonicsData } = audioData;
      const count = caseConesRef.current.length;
      caseConesRef.current.forEach((cone, i) => {
        if (cone) {
          const angle = (i / count) * Math.PI * 2;
          const xSymmetry = Math.abs(Math.cos(angle));
          const maxBandIndex = Math.floor(harmonicsData.length / 6);
          const bandIndex = Math.floor(xSymmetry * maxBandIndex);
          const amplitude = harmonicsData[bandIndex] || 0;
          cone.position.y = 3.5 + amplitude * 5.0;
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
      <MeshaCheek
        ref={meshaCheekRef}
        color={color}
        labelSize={labelSize}
        isThisLanguageSelected={isThisLanguageSelected}
        audioData={audioData}
        linguisticProperties={linguisticProperties}
        audioReactiveSurface={audioReactiveSurface}
        segments={segments}
      />

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

      <MeshaMouth
        color={color}
        audioReactiveSurface={audioReactiveSurface}
        segments={segments}
        wordOrderAmplitude={wordOrderAmplitude}
        labelSize={labelSize}
        linguisticProperties={linguisticProperties}
        isThisLanguageSelected={isThisLanguageSelected}
        audioData={audioData}
      />

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
