import { useRef, useMemo } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three"; // <-- ADD
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";
import { defaultAudioData } from "../../config/meshaDefaultAudioData.js";
import linguisticConfig from "../../config/linguisticConfig.json";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAppState } from "../../contexts/AppStateContext";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { sortLanguages } from "../../utils/sortingUtils";
import { shiftHue } from "../../utils/colorUtils";
import MeshaEye from "./MeshaEye.jsx";
import MeshaCheek from "./MeshaCheek.jsx";
import MeshaMouth from "./MeshaMouth.jsx";
import MeshaBadge from "./MeshaBadge.jsx";

extend({ ParametricGeometry });

const Mesha = ({ languageCode, position, color }) => {
  const groupRef = useRef();
  const rotationGroupRef = useRef();
  const eyesGroupRef = useRef();
  const meshaCheekRef = useRef();
  const casesRef = useRef([]);
  const { controls } = useControls();
  const {
    meshaSize,
    sphereRadius,
    labelContent,
    sortLanguagesBy,
    isReverse,
    eyeZPositionMultiplier,
    eyeXPosition,
    eyeYOffset,
    badgeSize,
  } = controls;
  const { data } = useAppState();
  const { languageData, languageGroups, speakerData, typologicalFeatures } =
    data || {};

  let finalLanguageCode = languageCode;
  let finalPosition = position;

  if (!finalLanguageCode) {
    const allLanguages = Object.keys(languageData);
    const sorted = sortLanguages({
      allLanguages: [...allLanguages],
      languageData,
      languageGroups,
      speakerData,
      typologicalFeatures,
      sortLanguagesBy,
      labelContent,
      isReverse,
    });
    finalLanguageCode = sorted[0];
    let z = sphereRadius;
    finalPosition = [-z, 0, z];
  }

  const spring = useSpring({
    position: finalPosition,
    scale: [meshaSize, meshaSize, meshaSize],
    config: { mass: 1, tension: 120, friction: 20 },
  });

  const mouthColor = shiftHue(color, 10);

  const linguisticProperties = finalLanguageCode
    ? data?.typologicalFeatures?.[finalLanguageCode]
    : undefined;

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
  const evidentialityScore =
    linguisticConfig.evidentiality.values[linguisticProperties?.evidentiality]
      ?.score;
  const verbAspectScore =
    linguisticConfig.verbAspect.values[linguisticProperties?.verbAspect]?.score;

  const lastAudioDataRef = useRef(defaultAudioData);

  const { audioData: rawAudioData } = useAudioAnimation();

  const isInitialState = !languageCode;

  let audioData;
  if (isInitialState) {
    audioData = defaultAudioData;
    lastAudioDataRef.current = defaultAudioData;
  } else if (rawAudioData.isActive) {
    audioData = rawAudioData;
    lastAudioDataRef.current = rawAudioData;
  } else {
    audioData = lastAudioDataRef.current;
  }

  const wordOrderAmplitude = useMemo(() => {
    const flexibility = linguisticProperties?.wordOrderFlexibility;
    const score =
      linguisticConfig.wordOrderFlexibility.values[flexibility]?.score;
    return 1 + score * 0.5;
  }, [linguisticProperties?.wordOrderFlexibility]);

  const createAudioReactiveSurface = (
    meshaSize,
    audioDataValue,
    meshConfig,
  ) => {
    const {
      maxDeformation,
      fundamentalAmplifier,
      harmonicsAmplifier,
      verticalVariationMultiplier,
      symmetricalMirroring,
    } = meshConfig;

    const frequencyBands = 32;

    const flexibility = linguisticProperties?.wordOrderFlexibility;
    const flexibilityScore =
      linguisticConfig.wordOrderFlexibility.values[flexibility]?.score || 1;
    const flexibilityAmplitude = 1 + flexibilityScore * 0.5;

    return (u, v, target) => {
      const size = meshaSize;
      const z = (u - 0.5) * size;
      const x = (v - 0.5) * size;
      let y = symmetricalMirroring ? wordOrderAmplitude : flexibilityAmplitude;

      if (audioDataValue.isActive) {
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

    if (casesRef.current && audioData.isActive) {
      const { harmonicsData } = audioData;
      const count = casesRef.current.length;
      const bandDivisor = 6;
      casesRef.current.forEach((caseGroup, i) => {
        if (caseGroup) {
          const angle = (i / count) * Math.PI * 2;
          const xSymmetry = Math.abs(Math.cos(angle));
          const bandIndex = Math.floor(
            (xSymmetry * harmonicsData.length) / bandDivisor,
          );
          const amplitude = harmonicsData[bandIndex] || 0;
          const baseY = cases[i]?.y || -1;
          caseGroup.position.y = baseY + amplitude * 2;
          const scale = 0.3 + amplitude;
          caseGroup.scale.set(scale, scale, scale);
        }
      });
    }
  });

  const audioReactiveSurface = useMemo(
    () =>
      createAudioReactiveSurface(
        meshaSize,
        audioData,
        audioVisualizationConfig.meshDeformation,
      ),
    [meshaSize, audioData],
  );

  const segments = audioVisualizationConfig.meshDeformation.meshSegments;
  const eyeZ = meshaSize * eyeZPositionMultiplier;

  const cases = useMemo(() => {
    const count = linguisticProperties?.caseCount;
    if (!count) return null;

    const spacing = (eyeXPosition * 4) / count;
    const startX = eyeXPosition * 2;
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push({
        x: startX - i * spacing,
        y: -2,
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
  const leftEyeSize = Array(3).fill(1 + evidentialityScore / 10);
  const rightEyeSize = Array(3).fill(1 + verbAspectScore / 8);

  // --- USE ANIMATED GROUP FOR SEAMLESS TRANSITIONS ---
  return (
    <a.group ref={groupRef} position={spring.position} scale={spring.scale}>
      <group ref={rotationGroupRef}>
        <MeshaCheek
          ref={meshaCheekRef}
          color1={shiftHue(color, 60)}
          color2={shiftHue(color, 30)}
          labelSize={1}
          audioData={audioData}
          languageCode={finalLanguageCode}
          audioReactiveSurface={audioReactiveSurface}
          segments={segments}
        />

        <group ref={eyesGroupRef} position={[0, 1, eyeZ]}>
          <MeshaEye
            position={[-eyeXPosition, 0, 0]}
            color={shiftHue(color, -10)}
            scale={leftEyeSize}
          />
          <MeshaEye
            position={[eyeXPosition, 0, 0]}
            color={shiftHue(color, 10)}
            scale={rightEyeSize}
          />
          <MeshaBadge
            textureFile={morphologyTextureFile}
            position={[0, -eyeXPosition * badgeSize, 0.7]}
            scale={[badgeSize, badgeSize, 1]}
          />

          <MeshaBadge
            textureFile={wordOrderTextureFile}
            position={[0, -eyeXPosition * badgeSize * 2, 0.8]}
            scale={[badgeSize, badgeSize, 1]}
            rotation={[0, badgeYRotation, 0]}
          />
        </group>

        <MeshaMouth
          color={mouthColor}
          audioReactiveSurface={audioReactiveSurface}
          segments={segments}
          wordOrderAmplitude={wordOrderAmplitude}
          languageCode={finalLanguageCode}
          audioData={audioData}
          meshaYRotation={meshaYRotation}
        />
        {cases &&
          cases.map((caseItem, i) => (
            <group
              key={caseItem.key}
              ref={(el) => (casesRef.current[i] = el)}
              position={[caseItem.x, caseItem.y, caseItem.z]}
            >
              <mesh rotation={[Math.PI, Math.PI, 0]}>
                <coneGeometry args={[0.5, 1, 7]} />
                <meshStandardMaterial color={"#ffffff"} />
              </mesh>
            </group>
          ))}
      </group>
    </a.group>
  );
};

export default Mesha;
