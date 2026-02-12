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
import { shiftHue, calculateLanguageColors } from "../../utils/colorUtils";
import { createAudioReactiveSurface } from "../../utils/audioReactiveSurface.js";
import MeshaEye from "./MeshaEye.jsx";
import MeshaCheek from "./MeshaCheek.jsx";
import MeshaTongue from "./MeshaTongue.jsx";
import MeshaNose from "./MeshaNose.jsx";
import MeshaTeeth from "./MeshaTeeth.jsx";
import MeshaMoustache from "./MeshaMoustache.jsx";

extend({ ParametricGeometry });

const Mesha = () => {
  const groupRef = useRef();
  const rotationGroupRef = useRef();
  const eyesGroupRef = useRef();
  const meshaCheekRef = useRef();
  const meshaRotationRef = useRef(0);
  const lastAudioDataRef = useRef(defaultAudioData);

  const { controls } = useControls();
  const { selectedLanguage, groupColors } = useLanguageSelection();
  const { data } = useAppState();
  const { formattedPositions } = useLayoutManager(data, controls, null);

  const { meshaSize, eyeZ, eyeX, eyeY, noseSize, sphereRadius } = controls;

  const languageCode = useMemo(() => {
    if (selectedLanguage) return selectedLanguage;
    const codes = Object.keys(data?.languageData || {});
    return codes[0] || "eng";
  }, [selectedLanguage, data]);

  const position = useMemo(() => {
    if (selectedLanguage && formattedPositions[selectedLanguage]) {
      const pos = formattedPositions[selectedLanguage];
      return [pos.x, pos.y, pos.z];
    }
    return [-sphereRadius - meshaSize, 0, sphereRadius];
  }, [selectedLanguage, formattedPositions, sphereRadius, meshaSize]);

  // Calculate color using the same utility
  const color = useMemo(() => {
    if (!data?.languageData || !data?.languageGroups || !groupColors) {
      return "#ffffff";
    }
    const languageColors = calculateLanguageColors(
      data.languageData,
      data.languageGroups,
      groupColors,
      30,
    );
    return languageColors[languageCode];
  }, [data?.languageData, data?.languageGroups, groupColors, languageCode]);

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
  });

  const segments = audioVisualizationConfig.meshDeformation.meshSegments;
  const mainZ = meshaSize * eyeZ;

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

        <MeshaTongue
          mouthMaterial={mouthMaterial}
          audioReactiveSurface={(u, v, target) =>
            createAudioReactiveSurface(audioData, {
              size: meshaSize,
              bend: 0,
              radius: meshaSize,
            })(u, v, target)
          }
          segments={segments}
        />

        <MeshaTeeth languageCode={languageCode} />

        <MeshaMoustache
          languageCode={languageCode}
          meshaRotationRef={meshaRotationRef}
        />
      </group>
    </a.group>
  );
};

export default Mesha;
