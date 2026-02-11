import { useRef, useMemo } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";
import { defaultAudioData } from "../../config/meshaDefaultAudioData.js";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { useAppState } from "../../contexts/AppStateContext";
import { useLayoutManager } from "../../hooks/useLayoutManager.js";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { useTonalityMaterial } from "../../hooks/useTonalityMaterial.js";
import { getFeatureScoreList } from "../../utils/linguisticUtils.js";
import { shiftHue } from "../../utils/colorUtils";
import { createAudioReactiveSurface } from "../../utils/audioReactiveSurface.js";
import MeshaEye from "./MeshaEye.jsx";
import MeshaCheek from "./MeshaCheek.jsx";
import MeshaMouth from "./MeshaMouth.jsx";
import MeshaNose from "./MeshaNose.jsx";

extend({ ParametricGeometry });

const Mesha = () => {
  const groupRef = useRef();
  const rotationGroupRef = useRef();
  const eyesGroupRef = useRef();
  const meshaCheekRef = useRef();
  const casesRef = useRef([]);
  const meshaRotationRef = useRef(0);
  const lastAudioDataRef = useRef(defaultAudioData);

  const { controls } = useControls();
  const { selectedLanguage, groupColors } = useLanguageSelection();
  const { data } = useAppState();
  const { formattedPositions } = useLayoutManager(data, controls, null);

  const { meshaSize, eyeZ, eyeX, eyeY, noseSize, sphereRadius } = controls;

  // Determine which language code to use
  const languageCode = useMemo(() => {
    if (selectedLanguage) return selectedLanguage;
    const codes = Object.keys(data?.languageData || {});
    return codes[0] || "eng";
  }, [selectedLanguage, data]);

  // Calculate position
  const position = useMemo(() => {
    if (selectedLanguage && formattedPositions[selectedLanguage]) {
      const pos = formattedPositions[selectedLanguage];
      return [pos.x, pos.y, pos.z];
    }
    return [-sphereRadius - meshaSize, 0, sphereRadius];
  }, [selectedLanguage, formattedPositions, sphereRadius, meshaSize]);

  // Calculate color
  const meshaGroupKey = useMemo(
    () =>
      data?.languageData?.[languageCode]?.group ||
      data?.languageGroups?.[languageCode],
    [data, languageCode],
  );
  const color = groupColors?.[meshaGroupKey];

  if (!data || !languageCode) return null;

  const linguisticProperties = data?.typologicalFeatures?.[languageCode];
  const scores = getFeatureScoreList(linguisticProperties, [
    "wordOrderFlexibility",
    "morphology",
    "evidentiality",
    "verbAspect",
  ]);

  const spring = useSpring({
    position,
    scale: [meshaSize, meshaSize, meshaSize],
    config: { mass: 1, tension: 120, friction: 20 },
  });

  const { audioData: rawAudioData } = useAudioAnimation();

  let audioData;
  if (rawAudioData.isActive) {
    audioData = rawAudioData;
    lastAudioDataRef.current = rawAudioData;
  } else {
    audioData = lastAudioDataRef.current;
  }

  const leftCheekMaterial = useTonalityMaterial(
    shiftHue(color, 30),
    languageCode,
  );
  const rightCheekMaterial = useTonalityMaterial(
    shiftHue(color, -30),
    languageCode,
  );
  const mouthMaterial = useTonalityMaterial(color, languageCode);

  useFrame(({ camera, clock }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }

    if (rotationGroupRef.current) {
      const time = clock.getElapsedTime();
      const damping = 2;
      const t = Math.sin(time * 0.3);
      const eased = Math.sign(t) * Math.pow(Math.abs(t), damping);
      const rotation = eased * (Math.PI / 3);
      rotationGroupRef.current.rotation.y = rotation;
      meshaRotationRef.current = rotation;
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

  const evidentialitySize = 1 + scores.evidentiality / 4;
  const verbAspectSize = scores.verbAspect / 4;

  return (
    <a.group ref={groupRef} position={spring.position} scale={spring.scale}>
      <group ref={rotationGroupRef}>
        <MeshaCheek
          ref={meshaCheekRef}
          leftCheekMaterial={leftCheekMaterial}
          rightCheekMaterial={rightCheekMaterial}
          audioReactiveSurface={(u, v, target) =>
            createAudioReactiveSurface(audioData, {
              size: meshaSize,
              bend: scores.morphology / 3,
              radius: meshaSize,
            })(u, v, target)
          }
          leftSegments={10 - scores.morphology}
          rightSegments={2 + scores.morphology * 2}
          scores={scores}
        />

        <group ref={eyesGroupRef} position={[0, 1, mainZ]}>
          <MeshaEye
            position={[-eyeX, eyeY, 0]}
            color={color}
            evidentialitySize={evidentialitySize}
            verbAspectSize={verbAspectSize}
          />
          <MeshaEye
            position={[eyeX, eyeY, 0]}
            color={color}
            evidentialitySize={evidentialitySize}
            verbAspectSize={verbAspectSize}
          />
          <MeshaNose
            position={[0, eyeY - eyeX / 2, 0]}
            scale={noseSize}
            color={color}
            wordOrder={linguisticProperties?.wordOrder}
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
          audioData={audioData}
          languageCode={languageCode}
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
