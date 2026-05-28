import { useRef, useMemo, useEffect } from "react";
import { extend } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { config } from "../../modules/configStore";
import microphoneService from "../../services/microphoneService.js";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import { useEntrance } from "../../contexts/EntranceContext.jsx";
import { useShaderMaterial } from "../../hooks/useShaderMaterial.js";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { getFeatureScoreList } from "../../utils/linguisticUtils.js";
import { shiftHue } from "../../utils/colorUtils";
import MeshaEyes from "./MeshaEyes.jsx";
import MeshaEar from "./MeshaEars.jsx";
import MeshaTongue from "./MeshaTongue.jsx";
import MeshaNose from "./MeshaNose.jsx";
import MeshaTeeth from "./MeshaTeeth.jsx";
import MeshaMoustache from "./MeshaMoustache.jsx";
import MeshaLight from "./MeshaLight.jsx";
import SpeechBalloon from "./SpeechBalloon";

extend({ ParametricGeometry });
extend({ TextGeometry });

const Mesha = ({
  linguisticProperties,
  color,
  position,
  isMyMesha,
  stripesType,
  looksAround,
  renderOrder,
  rotateSpeed,
  isMotionReduced,
}) => {
  const groupRef = useRef();
  const lookAroundRef = useRef();
  const lookAroundRotationRef = useRef(0);

  const { controls } = useControls();
  const {
    meshaSize,
    eyeZ,
    eyeX,
    eyeY,
    eyeSize,
    noseSize,
    earSize,
    tension,
    friction,
    axis,
    switchDuration,
  } = controls;
  const { selectedProperty, setSelectedProperty, selectedLanguage } =
    useLanguageSelection();

  const { isMeshaSequenceDone, isEntranceComplete } = useEntrance();

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

  const scores = getFeatureScoreList(linguisticProperties, [
    "wordOrderFlexibility",
    "morphology",
    "evidentiality",
    "verbAspect",
  ]);

  const {
    phonemeCount,
    caseCount,
    wordOrder,
    nounClassCount,
    maxConsonantClusterSize,
  } = linguisticProperties;

  const noseColorMap = {
    S: "#e7ebef",
    V: color,
    O: "#222222",
  };

  const noseSegmentColors = [
    noseColorMap[wordOrder[0]],
    noseColorMap[wordOrder[1]],
    noseColorMap[wordOrder[2]],
  ];

  const { entranceDuration } = config.entrance;
  const { sphereRadius } = config.layout;
  const targetPosition = isMeshaSequenceDone ? position : [0, 0, sphereRadius];

  const spring = useSpring({
    x: targetPosition[0],
    y: targetPosition[1],
    z: targetPosition[2],
    config: {
      duration: isEntranceComplete ? switchDuration : entranceDuration,
    },
    immediate: isMotionReduced || !isMeshaSequenceDone,
  });

  const skinColor = shiftHue(color, -60);
  const skinColorInvert = shiftHue(color, 60);

  const skinMaterial = useShaderMaterial(skinColor, skinColorInvert, 0);
  const tongueMaterial = useShaderMaterial(
    skinColorInvert,
    skinColor,
    stripesType,
  );

  useThrottledFrame(({ clock, camera }) => {
    if (looksAround && lookAroundRef.current && isMeshaSequenceDone) {
      const time = clock.getElapsedTime();
      const speed = rotateSpeed;
      const rotation = time * speed;

      lookAroundRef.current.rotation[axis] = rotation;
      lookAroundRotationRef.current = rotation;
    }
  });

  const segments = config.meshDeformation.meshSegments;

  const earPosition = useMemo(
    () => ({
      x: 1.5 - scores.morphology / 2,
      y: (scores.morphology + 1) / 4,
      z: 1,
    }),
    [scores.morphology],
  );

  const handlePropertyClick = (e) => {
    e.stopPropagation();
    const prop = e.object.linguisticProperty;
    setSelectedProperty(selectedProperty === prop ? null : prop);
  };

  return (
    <a.group
      ref={groupRef}
      position-x={spring.x}
      position-y={spring.y}
      position-z={spring.z}
    >
      <group ref={lookAroundRef} scale={meshaSize}>
        <MeshaEar
          earMaterial={skinMaterial}
          size={earSize}
          bend={scores.morphology / 3}
          segments={2 + scores.morphology * 3}
          earPosition={earPosition}
          onClick={handlePropertyClick}
          isSelected={selectedProperty === "morphology"}
        />

        <MeshaEyes
          irisColor={color}
          eyelidColor={skinColor}
          size={scores.evidentiality}
          depth={scores.verbAspect}
          isoCode={selectedLanguage}
          mainZ={eyeZ}
          onClick={handlePropertyClick}
          isSelectedOuter={selectedProperty === "evidentiality"}
          isSelectedInner={selectedProperty === "verbAspect"}
        />

        <MeshaNose
          position={[0, eyeY - eyeSize, eyeZ]}
          scale={noseSize}
          segmentColors={noseSegmentColors}
          motionIntensity={scores.wordOrderFlexibility}
          rotationRef={lookAroundRotationRef}
          onClick={handlePropertyClick}
          isSelectedOuter={selectedProperty === "wordOrder"}
          isSelectedInner={selectedProperty === "wordOrderFlexibility"}
        />

        <MeshaTongue
          tongueMaterial={tongueMaterial}
          segments={segments}
          onClick={handlePropertyClick}
          isSelected={selectedProperty === "tonality"}
        />
        <MeshaTeeth
          toothCount={phonemeCount}
          consonantClusterSize={maxConsonantClusterSize}
          onClick={handlePropertyClick}
          isSelected={selectedProperty === "phonemeCount"}
        />
        {caseCount && (
          <MeshaMoustache
            linguisticProperty="caseCount"
            tuftCount={caseCount}
            color={shiftHue(color, 120)}
            y={eyeY / 2}
            z={eyeZ}
            onClick={handlePropertyClick}
            isSelected={selectedProperty === "caseCount"}
            audioBand="harmonicsData"
            stepDeg={3}
          />
        )}
        {nounClassCount && (
          <MeshaMoustache
            linguisticProperty="nounClassCount"
            tuftCount={nounClassCount}
            color={color}
            y={(eyeY * 4) / 3}
            z={eyeZ}
            onClick={handlePropertyClick}
            isSelected={selectedProperty === "nounClassCount"}
            audioBand="fundamentalData"
            stepDeg={12}
          />
        )}
        <SpeechBalloon anchorPosition={[0, eyeY, eyeZ]} />
      </group>
      <MeshaLight />
    </a.group>
  );
};

export default Mesha;
