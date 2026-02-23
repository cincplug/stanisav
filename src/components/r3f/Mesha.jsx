import { useRef, useMemo, useEffect } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";
import microphoneService from "../../services/microphoneService.js";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { useAppState } from "../../contexts/AppStateContext";
import { useLayoutManager } from "../../hooks/useLayoutManager.js";
import { useTonalityMaterial } from "../../hooks/useTonalityMaterial.js";
import { getFeatureScoreList } from "../../utils/linguisticUtils.js";
import { shiftHue, calculateLanguageColors } from "../../utils/colorUtils";
import MeshaEye from "./MeshaEye.jsx";
import MeshaCheek from "./MeshaCheek.jsx";
import MeshaTongue from "./MeshaTongue.jsx";
import MeshaNose from "./MeshaNose.jsx";
import MeshaTeeth from "./MeshaTeeth.jsx";
import MeshaMoustache from "./MeshaMoustache.jsx";
import NodeLight from "./NodeLight.jsx";

extend({ ParametricGeometry });

const Mesha = () => {
  const groupRef = useRef();
  const rotationGroupRef = useRef();
  const eyesGroupRef = useRef();
  const meshaRotationRef = useRef(0);

  const { controls } = useControls();
  const { selectedLanguage, groupColors } = useLanguageSelection();
  const { data } = useAppState();
  const { formattedPositions } = useLayoutManager(data, controls, null);

  const { meshaSize, eyeZ, eyeX, eyeY, noseSize, sphereRadius, isMyMesha } =
    controls;

  useEffect(() => {
    if (isMyMesha) {
      microphoneService.startCapture();
    } else {
      microphoneService.stopCapture();
    }
    return () => {
      microphoneService.stopCapture();
    };
  }, [isMyMesha]);

  const languageCode = useMemo(() => {
    if (selectedLanguage) return selectedLanguage;
    const codes = Object.keys(data?.languageData);
    return codes[0];
  }, [selectedLanguage, data]);

  const position = useMemo(() => {
    if (selectedLanguage && formattedPositions[selectedLanguage]) {
      const pos = formattedPositions[selectedLanguage];
      return [pos.x, pos.y, pos.z];
    }
    return [0, 0, sphereRadius - meshaSize];
  }, [selectedLanguage, formattedPositions, sphereRadius, meshaSize]);

  const color = useMemo(() => {
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

  // Linguistic -> representational mapping stays in Mesha
  const { toothCount, caseCount, wordOrder, nounClassCount } =
    linguisticProperties;

  const noseColorMap = {
    S: "#ffffff",
    V: color,
    O: "#222222",
  };

  // Linguistic mapping kept in Mesha, children get neutral props only
  const noseSegmentColors = [
    noseColorMap[wordOrder[0]],
    noseColorMap[wordOrder[1]],
    noseColorMap[wordOrder[2]],
  ];
  const noseMotionIntensity = scores.wordOrderFlexibility;

  const eyeSizeSignal = scores.evidentiality;
  const eyeDepthSignal = scores.verbAspect;

  const spring = useSpring({
    position,
    scale: selectedLanguage ? meshaSize : (meshaSize * 3) / 2,
    config: { mass: 1, tension: 120, friction: 20 },
  });

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

  const cheekPosition = useMemo(
    () => ({
      x: 1.4 - scores.morphology / 2,
      y: (scores.morphology + 1) / 4,
      z: 1,
    }),
    [scores.morphology],
  );

  return (
    <a.group ref={groupRef} position={spring.position} scale={spring.scale}>
      <group ref={rotationGroupRef}>
        <MeshaCheek
          leftCheekMaterial={leftCheekMaterial}
          rightCheekMaterial={rightCheekMaterial}
          meshaSize={meshaSize}
          bend={scores.morphology / 3}
          leftSegments={10 - scores.morphology}
          rightSegments={2 + scores.morphology * 2}
          cheekPosition={cheekPosition}
        />

        <group ref={eyesGroupRef} position={[0, 1, mainZ]}>
          <MeshaEye
            position={[-eyeX, eyeY, 0]}
            color={color}
            sizeSignal={eyeSizeSignal}
            depthSignal={eyeDepthSignal}
          />
          <MeshaEye
            position={[eyeX, eyeY, 0]}
            color={color}
            sizeSignal={eyeSizeSignal}
            depthSignal={eyeDepthSignal}
          />
          <MeshaNose
            position={[0, eyeY - eyeX / 2, 0]}
            scale={noseSize}
            segmentColors={noseSegmentColors}
            motionIntensity={noseMotionIntensity}
            meshaRotationRef={meshaRotationRef}
          />
        </group>

        <MeshaTongue mouthMaterial={mouthMaterial} segments={segments} />
        <MeshaTeeth toothCount={toothCount} />
        <MeshaMoustache moustacheCount={caseCount} color={color} y={0.5} />
        <MeshaMoustache
          moustacheCount={nounClassCount}
          color={shiftHue(color, 120)}
          y={meshaSize}
        />
      </group>
      <NodeLight spread={2} />
    </a.group>
  );
};

export default Mesha;
