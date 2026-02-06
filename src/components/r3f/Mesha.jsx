import { useRef, useMemo } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";
import { defaultAudioData } from "../../config/meshaDefaultAudioData.js";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAppState } from "../../contexts/AppStateContext";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { useTonalityMaterial } from "../../hooks/useTonalityMaterial.js";
import { shiftHue } from "../../utils/colorUtils";
import { createAudioReactiveSurface } from "../../utils/audioReactiveSurface.js";
import { getFeatureScoreList } from "../../utils/linguisticUtils.js";
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
  const meshaRotationRef = useRef(0);
  const { controls } = useControls();
  const { meshaSize, eyeZ, eyeX, eyeY } = controls;
  const { data } = useAppState();
  const { languageData, typologicalFeatures } = data;

  const spring = useSpring({
    position,
    scale: [meshaSize, meshaSize, meshaSize],
    config: { mass: 1, tension: 120, friction: 20 },
  });

  const mouthColor = color;

  const linguisticProperties = languageData?.[languageCode]
    ? typologicalFeatures?.[languageCode]
    : undefined;

  const wordOrder = linguisticProperties?.wordOrder;

  const scores = getFeatureScoreList(linguisticProperties, [
    "wordOrderFlexibility",
    "morphology",
    "evidentiality",
    "verbAspect",
  ]);

  const lastAudioDataRef = useRef(defaultAudioData);

  const { audioData: rawAudioData } = useAudioAnimation();

  let audioData;
  if (rawAudioData.isActive) {
    audioData = rawAudioData;
    lastAudioDataRef.current = rawAudioData;
  } else {
    audioData = lastAudioDataRef.current;
  }

  const leftCheekMaterial = useTonalityMaterial(
    shiftHue(color, 45),
    languageCode,
  );
  const rightCheekMaterial = useTonalityMaterial(
    shiftHue(color, -45),
    languageCode,
  );
  const mouthMaterial = useTonalityMaterial(mouthColor, languageCode);

  useFrame(({ camera, clock }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }

    if (rotationGroupRef.current) {
      const time = clock.getElapsedTime();
      const rotation = Math.sin(time * 0.3) * (Math.PI / 6);
      rotationGroupRef.current.rotation.y = rotation;
      meshaRotationRef.current = rotation;
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

  const leftEyeSize = Array(3).fill(1 + scores.evidentiality / 4);
  const rightEyeSize = Array(3).fill(1 + scores.verbAspect / 4);

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
              bend: scores.morphology / 3,
              radius: meshaSize,
            })(u, v, target)
          }
          leftSegments={14 - scores.morphology}
          rightSegments={2 + scores.morphology}
        />

        <group ref={eyesGroupRef} position={[0, 1, mainZ]}>
          <MeshaEye
            position={[-eyeX, 0, 0]}
            color={color}
            scale={leftEyeSize}
            wordOrder={wordOrder}
            wordOrderFlexibilityScore={scores.wordOrderFlexibility}
            meshaRotationRef={meshaRotationRef}
          />
          <MeshaEye
            position={[eyeX, 0, 0]}
            color={color}
            scale={rightEyeSize}
            wordOrder={wordOrder}
            wordOrderFlexibilityScore={scores.wordOrderFlexibility}
            meshaRotationRef={meshaRotationRef}
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
          languageCode={languageCode}
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
