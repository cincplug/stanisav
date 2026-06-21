import { a, useSpring } from "@react-spring/three";
import { extend } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Euler, MathUtils, Quaternion } from "three";
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

const scratchEuler = new Euler();
const scratchQuat = new Quaternion();

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

  const { data } = useAppStateContext();
  const { languageColors } = useLanguageColorsContext();
  const { controls } = useControlsContext();
  const {
    meshaSize,
    eyeZ,
    eyeY,
    eyeSize,
    noseSize,
    earSize,
    switchDuration,
    sphereRadius,
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

  // Mesha.jsx — add this effect after the existing microphone useEffect

  useEffect(() => {
    if (!selectedLanguage) {
      saltoRotXRef.current = 0;
      saltoRotZRef.current = 0;
      saltoPhaseRef.current = 0;
    }
  }, [selectedLanguage]);

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
  const {
    skinHueShift,
    moustacheHueShift,
    moustacheY,
    eyebrowY,
    segments,
    earBend,
    saltoAmplitude,
    saltoFrequency,
    saltoPow,
  } = config.meshaVisualization;

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

  const initialPosition = [0, 0, sphereRadius];
  const targetPosition = isMeshaSequenceDone ? position : initialPosition;

  const spring = useSpring({
    x: targetPosition[0],
    y: targetPosition[1],
    z: targetPosition[2],
    config: {
      duration: isEntranceComplete ? switchDuration : labelsEntranceDuration,
    },
    immediate: isMotionReduced || !isMeshaSequenceDone,
  });

  const skinColor = shiftHue(color, skinHueShift);
  const skinColorInvert = shiftHue(color, -skinHueShift);

  const skinMaterial = useShaderMaterial(skinColor, skinColorInvert, 0);
  const tongueMaterial = useShaderMaterial(
    skinColorInvert,
    skinColor,
    stripesType,
  );

  const moustacheColor = shiftHue(color, moustacheHueShift);
  const eyebrowColor = shiftHue(color, -moustacheHueShift);

  const rotationYRef = useRef(0);
  const saltoPhaseRef = useRef(0);
  const prevWordOrderFlexibilityRef = useRef("");
  const saltoRotXRef = useRef(0);
  const saltoRotZRef = useRef(0);

  useThrottledFrame(({ camera }, delta) => {
    if (!looksAround || !lookAroundRef.current) return;

    const isBlocked = isDragging || wordOrderFlexibility === "rigid";
    const wasFlexible = prevWordOrderFlexibilityRef.current === "flexible";
    prevWordOrderFlexibilityRef.current = wordOrderFlexibility;

    if (!isBlocked) {
      rotationYRef.current =
        (rotationYRef.current + delta * rotateSpeed) % (Math.PI * 2);
    }

    if (wordOrderFlexibility === "flexible" && !isBlocked) {
      if (!wasFlexible) {
        saltoPhaseRef.current =
          Math.round(rotationYRef.current / Math.PI) * Math.PI;
      }

      saltoPhaseRef.current =
        (saltoPhaseRef.current + delta * rotateSpeed * saltoFrequency) %
        (Math.PI * 2);

      const sinPhase = Math.sin(saltoPhaseRef.current);
      const cosPhase = Math.cos(saltoPhaseRef.current);
      saltoRotXRef.current =
        Math.sign(cosPhase) *
        Math.pow(Math.abs(sinPhase), saltoPow) *
        saltoAmplitude *
        Math.PI;
      saltoRotZRef.current =
        Math.sign(sinPhase) *
        Math.pow(Math.abs(cosPhase), saltoPow) *
        saltoAmplitude *
        Math.PI;
    } else {
      saltoRotXRef.current = MathUtils.damp(
        saltoRotXRef.current,
        Math.round(saltoRotXRef.current / (Math.PI * 2)) * (Math.PI * 2),
        4,
        delta,
      );
      saltoRotZRef.current = MathUtils.damp(
        saltoRotZRef.current,
        Math.round(saltoRotZRef.current / (Math.PI * 2)) * (Math.PI * 2),
        4,
        delta,
      );

      if (wasFlexible) {
        saltoPhaseRef.current = 0;
      }
    }

    lookAroundRef.current.quaternion.copy(camera.quaternion);
    scratchEuler.set(
      saltoRotXRef.current,
      rotationYRef.current,
      saltoRotZRef.current,
      "YXZ",
    );
    scratchQuat.setFromEuler(scratchEuler);
    lookAroundRef.current.quaternion.multiply(scratchQuat);
  });

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
          bend={scores.morphology * earBend}
          segments={scores.morphology}
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
            color={moustacheColor}
            y={moustacheY}
            z={eyeZ}
            isSelected={selectedProperty === "caseCount"}
            audioBand="harmonicsData"
            stepDeg={6}
          />
        )}
        {nounClassCount && (
          <MeshaMoustache
            linguisticProperty="nounClassCount"
            tuftCount={nounClassCount}
            color={eyebrowColor}
            y={eyebrowY}
            z={eyeZ}
            isSelected={selectedProperty === "nounClassCount"}
            audioBand="fundamentalData"
            stepDeg={12}
          />
        )}
      </group>
      <SpeechBalloon position="bottom-right" anchorOffset={[0, eyeY, eyeZ]} />
      <MeshaLight />
    </a.group>
  );
};

export default Mesha;
