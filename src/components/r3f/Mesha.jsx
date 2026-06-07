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
  buildPropertyBalloonText,
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

  const { data, setBalloonText } = useAppStateContext();
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
    axis,
    switchDuration,
  } = controls;
  const { selectedProperty, setSelectedProperty, selectedLanguage } =
    useLanguageSelectionContext();

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
  const { sphereRadius } = config.layout;

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

  const targetPosition = isMeshaSequenceDone ? position : [0, 0, sphereRadius];

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

  useThrottledFrame(({ clock, camera }) => {
    if (looksAround && lookAroundRef.current) {
      if (isDragging || !isEntranceComplete) return;

      if (wordOrderFlexibility === "rigid") {
        groupRef.current.lookAt(camera.position);
        return;
      }
      if (wordOrderFlexibility === "semi-flexible") {
        groupRef.current.lookAt(camera.position);
      }
      const time = clock.getElapsedTime();
      const speed = rotateSpeed;
      const rotation = time * speed;
      lookAroundRef.current.rotation[axis] = rotation;
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

  const handlePropertyClick = (e) => {
    e.stopPropagation();
    const propertyKey = e.object.linguisticProperty;
    const nextProperty = selectedProperty === propertyKey ? null : propertyKey;
    setSelectedProperty(nextProperty);
    setBalloonText(
      nextProperty
        ? buildPropertyBalloonText(
            nextProperty,
            linguisticProperties[nextProperty],
          )
        : "",
    );
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
          evidentiality={scores.evidentiality}
          verbAspect={scores.verbAspect}
          isoCode={selectedLanguage}
          onClick={handlePropertyClick}
          isSelectedOuter={selectedProperty === "evidentiality"}
          isSelectedInner={selectedProperty === "verbAspect"}
        />

        <MeshaNose
          position={[0, eyeY - eyeSize, eyeZ]}
          scale={noseSize}
          segmentColors={noseSegmentColors}
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
      </group>
      <SpeechBalloon
        position={selectedLanguage ? "bottom" : "top-right"}
        anchorPosition={
          selectedLanguage ? [0, -eyeY, eyeZ] : [eyeX, eyeY * 2, eyeZ]
        }
      />
      <MeshaLight />
    </a.group>
  );
};

export default Mesha;
