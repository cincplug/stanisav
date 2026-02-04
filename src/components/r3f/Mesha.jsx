import { useRef, useMemo } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";
import { defaultAudioData } from "../../config/meshaDefaultAudioData.js";
import linguisticConfig from "../../config/linguisticConfig.json";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAppState } from "../../contexts/AppStateContext";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { useTonalityMaterial } from "../../hooks/useTonalityMaterial.js";
import { sortLanguages } from "../../utils/sortingUtils";
import { shiftHue } from "../../utils/colorUtils";
import { createAudioReactiveSurface } from "../../utils/audioReactiveSurface.js";
import MeshaEye from "./MeshaEye.jsx";
import MeshaCheek from "./MeshaCheek.jsx";
import MeshaMouth from "./MeshaMouth.jsx";

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
    eyeZ,
    eyeX,
    eyeY,
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

  const wordOrder = linguisticProperties.wordOrder;
  const wordOrderFlexibilityScore =
    linguisticConfig.wordOrderFlexibility.values[
      linguisticProperties?.wordOrderFlexibility
    ]?.score;
  const morphologyScore =
    linguisticConfig.evidentiality.values[linguisticProperties?.evidentiality]
      ?.score;
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

  const leftCheekMaterial = useTonalityMaterial(
    shiftHue(color, 60),
    finalLanguageCode,
  );
  const rightCheekMaterial = useTonalityMaterial(
    shiftHue(color, 30),
    finalLanguageCode,
  );
  const mouthMaterial = useTonalityMaterial(mouthColor, finalLanguageCode);

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
        eyesGroupRef.current.position.y = (maxY1 + maxY2) / 2 + eyeY;
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

  const segments = audioVisualizationConfig.meshDeformation.meshSegments;
  const mainZ = meshaSize * eyeZ;

  const cases = useMemo(() => {
    const count = linguisticProperties?.caseCount;
    if (!count) return null;

    const spacing = (eyeX * 4) / count;
    const totalWidth = spacing * (count - 1);
    const startX = totalWidth / 2;
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push({
        x: startX - i * spacing,
        y: 1 / 2,
        z: mainZ,
        key: `case-${i}`,
      });
    }
    return items;
  }, [linguisticProperties?.caseCount, eyeX, mainZ]);

  const leftEyeSize = Array(3).fill(1 + evidentialityScore / 10);
  const rightEyeSize = Array(3).fill(1 + verbAspectScore / 8);

  return (
    <a.group ref={groupRef} position={spring.position} scale={spring.scale}>
      <group ref={rotationGroupRef}>
        <MeshaCheek
          ref={meshaCheekRef}
          leftCheekMaterial={leftCheekMaterial}
          rightCheekMaterial={rightCheekMaterial}
          labelSize={1}
          audioData={audioData}
          audioReactiveSurface={(u, v, target) =>
            createAudioReactiveSurface(audioData, {
              size: meshaSize,
              bend: 0.4,
              radius: meshaSize,
            })(u, v, target)
          }
          leftSegments={morphologyScore * 3}
          rightSegments={wordOrderFlexibilityScore * 4}
        />

        <group ref={eyesGroupRef} position={[0, 1, mainZ]}>
          <MeshaEye
            position={[-eyeX, 0, 0]}
            color={color}
            scale={leftEyeSize}
            wordOrder={wordOrder}
          />
          <MeshaEye
            position={[eyeX, 0, 0]}
            color={color}
            scale={rightEyeSize}
            wordOrder={wordOrder}
          />
        </group>

        <MeshaMouth
          mouthMaterial={mouthMaterial}
          audioReactiveSurface={(u, v, target) =>
            createAudioReactiveSurface(audioData, {
              size: meshaSize,
              bend: 0,
              radius: meshaSize,
            })(u, v, target)
          }
          segments={segments}
          languageCode={finalLanguageCode}
          audioData={audioData}
        />
        {cases &&
          cases.map((caseItem, i) => (
            <group
              key={caseItem.key}
              ref={(el) => (casesRef.current[i] = el)}
              position={[caseItem.x, caseItem.y, caseItem.z]}
            >
              <mesh rotation={[Math.PI, Math.PI, 0]}>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial color={shiftHue(color, 90)} />
              </mesh>
            </group>
          ))}
      </group>
    </a.group>
  );
};

export default Mesha;
