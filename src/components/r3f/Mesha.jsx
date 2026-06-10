import { a, useSpring } from "@react-spring/three";
import { extend } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { useAppStateContext } from "../../contexts/AppStateContext.jsx";
import { useControlsContext } from "../../contexts/ControlsContext.jsx";
import { useDragContext } from "../../contexts/DragContext.jsx";
import { useEntranceContext } from "../../contexts/EntranceContext.jsx";
import { useLanguageColorsContext } from "../../contexts/LanguageColorsContext.jsx";
import { useLanguageSelectionContext } from "../../contexts/LanguageSelectionContext.jsx";
import { useShaderMaterial } from "../../hooks/useShaderMaterial.js";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { config } from "../../modules/configStore";
import microphoneService from "../../services/microphoneService.js";
import { shiftHue } from "../../utils/colorUtils";
import {
  getFeatureScore,
  getFeatureScoreList,
} from "../../utils/linguisticUtils.js";
import MeshaEar from "./MeshaEars.jsx";
import MeshaEyes from "./MeshaEyes.jsx";
import MeshaLight from "./MeshaLight.jsx";
import MeshaMoustache from "./MeshaMoustache.jsx";
import MeshaNose from "./MeshaNose.jsx";
import MeshaTeeth from "./MeshaTeeth.jsx";
import MeshaTongue from "./MeshaTongue.jsx";
import SpeechBalloon from "./SpeechBalloon";

extend({ ParametricGeometry });
extend({ TextGeometry });

const Mesha = ({
  languageCode,
  position,
  isMyMesha,
  looksAround,
  rotateSpeed,
  isMotionReduced,
}) => {
  const groupRef = useRef();
  const lookAroundRef = useRef();
  const lookAroundRotationRef = useRef(0);

  const { data } = useAppStateContext();
  const { languageColors } = useLanguageColorsContext();
  const { controls } = useControlsContext();
  const {
    meshaSize,
    eyeX,
    eyeZ,
    eyeY,
    eyeSize,
    noseSize,
    earSize,
    switchDuration,
  } = controls;
  const { selectedProperty, selectedLanguage } = useLanguageSelectionContext();

  const { isMeshaSequenceDone, isEntranceComplete } = useEntranceContext();
  const { isDragging } = useDragContext();

  const linguisticProperties = data?.typologicalFeatures?.[languageCode];
  const color = languageColors[languageCode];
  const stripesType =
    getFeatureScore("tonality", linguisticProperties?.tonality) - 1;

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
    wordOrderFlexibility,
  } = linguisticProperties;

  const { white, labelTextColor } = config.colors;
  const { labelsEntranceDuration } = config.entrance;

  const noseColorMap = {
    S: white,
    V: color,
    O: labelTextColor,
  };

  const noseSegmentColors = [
    noseColorMap[wordOrder[0]],
    noseColorMap[wordOrder[1]],
    noseColorMap[wordOrder[2]],
  ];

  const targetPosition = position;

  const spring = useSpring({
    x: targetPosition[0],
    y: targetPosition[1],
    z: targetPosition[2],
    config: {
      duration: isEntranceComplete ? switchDuration : labelsEntranceDuration,
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

  const rotationOffsetRef = useRef(0);
  const wasBlockedRef = useRef(false);

  useThrottledFrame(({ clock }) => {
    if (looksAround && lookAroundRef.current) {
      const isBlocked = isDragging || wordOrderFlexibility === "rigid";

      if (isBlocked) {
        wasBlockedRef.current = true;
        return;
      }

      const time = clock.getElapsedTime();

      if (wasBlockedRef.current) {
        rotationOffsetRef.current =
          lookAroundRotationRef.current - time * rotateSpeed;
        wasBlockedRef.current = false;
      }

      const rotation = time * rotateSpeed + rotationOffsetRef.current;
      lookAroundRef.current.rotation.y = rotation;

      lookAroundRef.current.rotation.z =
        wordOrderFlexibility === "flexible" ? rotation : 0;

      lookAroundRotationRef.current = rotation;
    }
  });

  const { segments } = config.meshaVisualization;

  const earPosition = useMemo(
    () => ({
      x: 1.5 - scores.morphology / 2,
      y: (scores.morphology + 1) / 4,
      z: 1,
    }),
    [scores.morphology],
  );

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
          isSelected={selectedProperty === "morphology"}
        />

        <MeshaEyes
          irisColor={color}
          eyelidColor={skinColor}
          evidentiality={scores.evidentiality}
          verbAspect={scores.verbAspect}
          isoCode={selectedLanguage}
          isSelectedOuter={selectedProperty === "evidentiality"}
          isSelectedInner={selectedProperty === "verbAspect"}
        />

        <MeshaNose
          position={[0, eyeY - eyeSize, eyeZ]}
          scale={noseSize}
          segmentColors={noseSegmentColors}
          isSelectedOuter={selectedProperty === "wordOrder"}
          isSelectedInner={selectedProperty === "wordOrderFlexibility"}
        />

        <MeshaTongue
          tongueMaterial={tongueMaterial}
          segments={segments}
          isSelected={selectedProperty === "tonality"}
        />
        <MeshaTeeth
          toothCount={phonemeCount}
          consonantClusterSize={maxConsonantClusterSize}
          isSelected={selectedProperty === "phonemeCount"}
        />
        {caseCount && (
          <MeshaMoustache
            linguisticProperty="caseCount"
            tuftCount={caseCount}
            color={shiftHue(color, 120)}
            y={eyeY / 2}
            z={eyeZ}
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
            isSelected={selectedProperty === "nounClassCount"}
            audioBand="fundamentalData"
            stepDeg={12}
          />
        )}
      </group>
      <SpeechBalloon
        position={selectedLanguage ? "bottom" : "right"}
        anchorPosition={
          selectedLanguage
            ? [0, -eyeY, eyeZ]
            : [eyeX + meshaSize + 2, eyeY * 2, eyeZ]
        }
      />
      <MeshaLight />
    </a.group>
  );
};

export default Mesha;
