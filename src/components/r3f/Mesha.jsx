import { useRef, useMemo } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { Color } from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";
import linguisticConfig from "../../config/linguisticConfig.json";
import MeshaEye from "./MeshaEye.jsx";
import MeshaCheek from "./MeshaCheek.jsx";
import MeshaMouth from "./MeshaMouth.jsx";
import MeshaBadge from "./MeshaBadge.jsx";

extend({ ParametricGeometry });

import { useAppState } from "../../contexts/AppStateContext";

const Mesha = ({ color, labelSize, languageCode }) => {
  const groupRef = useRef();
  const rotationGroupRef = useRef();
  const eyesGroupRef = useRef();
  const meshaCheekRef = useRef();
  const casesRef = useRef([]);
  const { selectedLanguage } = useLanguageSelection();
  const isThisLanguageSelected = selectedLanguage === languageCode;
  const { controls } = useControls();
  const { eyeYOffset, eyeXPosition, eyeZPositionMultiplier, badgeSize } =
    controls;

  const mouthColor = useMemo(
    () => new Color("#ffbbbb").sub(new Color(color)),
    [color]
  );

  const { data } = useAppState();
  const linguisticProperties = data?.typologicalFeatures?.[languageCode];

  // Prepare badge texture file paths (after linguisticProperties is defined)
  const wordOrder = linguisticProperties?.wordOrder;
  const wordOrderFlexibility =
    linguisticConfig.wordOrderFlexibility.values[
      linguisticProperties?.wordOrderFlexibility
    ]?.score;
  const morphology = linguisticProperties?.morphology;
  const wordOrderTextureFile = `/textures/${wordOrder.toLowerCase()}.png`;
  const morphologyTextureFile = `/textures/${morphology.toLowerCase()}.png`;
  const tonalityScore =
    linguisticConfig.tonality.values[linguisticProperties?.tonality]?.score;

  const { audioData } = useAudioAnimation(languageCode, isThisLanguageSelected);

  const wordOrderAmplitude = useMemo(() => {
    const flexibility = linguisticProperties?.wordOrderFlexibility;
    const score =
      linguisticConfig.wordOrderFlexibility.values[flexibility]?.score;
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

    const flexibility = linguisticProperties?.wordOrderFlexibility;
    const flexibilityScore =
      linguisticConfig.wordOrderFlexibility.values[flexibility]?.score || 1;
    const flexibilityAmplitude = 1 + flexibilityScore * 0.5;

    return (u, v, target) => {
      const size = labelSize;
      const z = (u - 0.5) * size;
      const x = (v - 0.5) * size;
      let y = symmetricalMirroring ? wordOrderAmplitude : flexibilityAmplitude;

      if (isSelectedForAudio && audioDataValue.isActive) {
        const { fundamentalData, harmonicsData } = audioDataValue;
        const verticalVariation =
          Math.sin(v * Math.PI * 2) * verticalVariationMultiplier;

        const uForBand = symmetricalMirroring && u > 0.5 ? 1 - u : u;
        const bandIndex = Math.floor(uForBand * (frequencyBands - 1));

        const fundamentalAmplitude = fundamentalData[bandIndex] || 0;
        const harmonicsAmplitude = harmonicsData[bandIndex] || 0;

        const balancedFundamental = fundamentalAmplitude * fundamentalAmplifier;
        const balancedHarmonics =
          harmonicsAmplitude *
          (symmetricalMirroring ? harmonicsAmplifier : tonalityScore / 10);
        const totalAmplitude = balancedFundamental + balancedHarmonics;

        y = totalAmplitude * maxDeformation * size;

        if (symmetricalMirroring && u > 0.5) {
          y *= 1 + verticalVariation;
        }
      }

      target.set(x, y, z);
    };
  };

  useFrame(({ camera, clock }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }

    if (rotationGroupRef.current) {
      const time = clock.getElapsedTime();
      rotationGroupRef.current.rotation.y =
        Math.sin(time * 0.3) * (Math.PI / 6);
    }

    if (
      meshaCheekRef.current?.mesh1 &&
      meshaCheekRef.current?.mesh2 &&
      eyesGroupRef.current
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
        eyesGroupRef.current.position.y = (maxY1 + maxY2) / 2 + eyeYOffset;
      }
    }

    if (casesRef.current && isThisLanguageSelected && audioData.isActive) {
      const { harmonicsData } = audioData;
      const count = casesRef.current.length;
      const bandDivisor = 6;
      casesRef.current.forEach((caseGroup, i) => {
        if (caseGroup) {
          const angle = (i / count) * Math.PI * 2;
          const xSymmetry = Math.abs(Math.cos(angle));
          const bandIndex = Math.floor(
            (xSymmetry * harmonicsData.length) / bandDivisor
          );
          const amplitude = harmonicsData[bandIndex] || 0;
          const baseY = cases[i]?.y || -1;
          caseGroup.position.y = baseY + amplitude * 2;
          const scale = 0.5 + amplitude;
          caseGroup.scale.set(scale, scale, scale);
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
  const eyeZ = labelSize * eyeZPositionMultiplier;

  const cases = useMemo(() => {
    const count = linguisticProperties?.caseCount || 0;
    if (count === 0) return [];

    const spacing = (eyeXPosition * 2) / Math.max(count - 1, 1);
    const startX = count === 1 ? 0 : eyeXPosition;
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push({
        x: startX - i * spacing,
        y: 1,
        z: eyeZ,
        key: `case-${i}`,
      });
    }
    return items;
  }, [linguisticProperties?.caseCount, eyeXPosition, eyeZ]);

  // Calculate badge y rotation as a function of Mesha's rotation and wordOrderFlexibility
  let meshaYRotation = 0;
  if (rotationGroupRef.current) {
    meshaYRotation = rotationGroupRef.current.rotation.y;
  }
  const badgeYRotation = meshaYRotation * wordOrderFlexibility;

  return (
    <group ref={groupRef}>
      <group ref={rotationGroupRef}>
        <MeshaCheek
          ref={meshaCheekRef}
          color={color}
          labelSize={labelSize}
          isThisLanguageSelected={isThisLanguageSelected}
          audioData={audioData}
          languageCode={languageCode}
          audioReactiveSurface={audioReactiveSurface}
          segments={segments}
        />

        <group ref={eyesGroupRef} position={[0, 1, eyeZ]}>
          <MeshaEye
            position={[eyeXPosition, 0, 0]}
            color={color}
            labelSize={labelSize}
          />
          <MeshaEye
            position={[-eyeXPosition, 0, 0]}
            color={color}
            labelSize={labelSize}
          />
          <MeshaBadge
            textureFile={morphologyTextureFile}
            position={[-eyeXPosition * badgeSize, -2, 0]}
            scale={[badgeSize, badgeSize, 1]}
          />

          <MeshaBadge
            textureFile={wordOrderTextureFile}
            position={[eyeXPosition * badgeSize, -2, 0]}
            scale={[badgeSize, badgeSize, 1]}
            rotation={[0, badgeYRotation, 0]}
          />
        </group>

        <MeshaMouth
          color={mouthColor}
          audioReactiveSurface={audioReactiveSurface}
          segments={segments}
          wordOrderAmplitude={wordOrderAmplitude}
          labelSize={labelSize}
          languageCode={languageCode}
          isThisLanguageSelected={isThisLanguageSelected}
          audioData={audioData}
        />
        {cases.map((caseItem, i) => (
          <group
            key={caseItem.key}
            ref={(el) => (casesRef.current[i] = el)}
            position={[caseItem.x, caseItem.y, caseItem.z]}
          >
            <mesh>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial
                color={mouthColor}
                emissive={mouthColor}
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

export default Mesha;
