import { a, useSpring } from "@react-spring/three";
import { extend } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Euler, MathUtils, Mesh, Quaternion } from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { useAppStateContext } from "../../../contexts/AppStateContext.jsx";
import { useConfigContext } from "../../../contexts/ConfigContext.jsx";
import { useEntranceContext } from "../../../contexts/EntranceContext.jsx";
import { useLanguageColorsContext } from "../../../contexts/LanguageColorsContext.jsx";
import { useLanguageSelectionContext } from "../../../contexts/LanguageSelectionContext.jsx";
import { usePlaylistContext } from "../../../contexts/PlaylistContext.jsx";
import { useShaderMaterial } from "../../../hooks/useShaderMaterial.js";
import { useThrottledFrame } from "../../../hooks/useThrottledFrame.js";
import microphoneService from "../../../services/microphoneService.js";
import { shiftHue } from "../../../utils/colorUtils.js";
import {
  getFeatureScore,
  getFeatureScoreList,
} from "../../../utils/linguisticUtils.js";
import Ears from "./Ears.jsx";
import Eyes from "./Eyes.jsx";
import Moustache from "./Moustache.jsx";
import Nose from "./Nose.jsx";
import Teeth from "./Teeth.jsx";
import Tongue from "./Tongue.jsx";
import Balloon from "./Balloon.jsx";

extend({ ParametricGeometry });
extend({ TextGeometry });

const scratchEuler = new Euler();
const scratchQuat = new Quaternion();

const Stanisav = ({
  languageCode,
  imposedProperties,
  position,
  isMyStanisav,
  spin,
  isMotionReduced,
  renderOrder,
  wideScale,
}) => {
  const groupRef = useRef();
  const lookAroundRef = useRef();

  const { languageColors } = useLanguageColorsContext();
  const { isAnimating, isPlaying, isCurrentSampleLuka } = usePlaylistContext();
  const { config } = useConfigContext();
  const {
    entranceDuration,
    switchDuration,
    assembleRate,
    isPhoenix,
    skinHueShift,
    tuftHueShift,
    tuftY,
    eyebrowY,
    saltoAmplitude,
    saltoFrequency,
    saltoPow,
    dampLambda,
    stanisavSize,
    eyeZ,
    eyeY,
    eyeSize,
    noseSize,
  } = config;

  const { selectedLanguage } = useLanguageSelectionContext();
  const { data } = useAppStateContext();

  const linguisticProperties = useMemo(() => {
    if (imposedProperties) return imposedProperties;

    return data?.languages?.[languageCode];
  }, [imposedProperties, data.languages]);

  const { isStanisavSequenceDone, isEntranceComplete, onStanisavSequenceDone } =
    useEntranceContext();

  const color = languageColors[languageCode];
  const stripesType =
    getFeatureScore("tonality", linguisticProperties?.tonality) - 1;

  useEffect(() => {
    if (isMyStanisav) {
      microphoneService.startCapture();
    } else {
      microphoneService.stopCapture();
    }
    return () => {
      microphoneService.stopCapture();
    };
  }, [isMyStanisav]);

  const runAssemble = useCallback(() => {
    if (!lookAroundRef.current) return;

    const meshes = [];
    lookAroundRef.current.traverse((object) => {
      if (object instanceof Mesh) meshes.push(object);
    });

    meshes.forEach((mesh) => {
      mesh.visible = false;
    });

    const timers = meshes.map((mesh, i) =>
      setTimeout(() => {
        mesh.visible = true;
        mesh.renderOrder = renderOrder;
        if (i === meshes.length - 1) onStanisavSequenceDone();
      }, i * assembleRate),
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    runAssemble();
  }, []);

  const prevIsAnimatingRef = useRef(false);

  useEffect(() => {
    if (!isPhoenix) return;
    const wasAnimating = prevIsAnimatingRef.current;
    prevIsAnimatingRef.current = isAnimating;

    if (!wasAnimating && isAnimating) runAssemble();
  }, [isAnimating]);

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
    wordOrderFlexibility,
  } = linguisticProperties;

  const spring = useSpring({
    x: position[0],
    y: position[1],
    z: position[2],
    scale: selectedLanguage ? 1 : wideScale,
    config: {
      duration: isEntranceComplete ? switchDuration : entranceDuration,
    },
    immediate: isMotionReduced || !isStanisavSequenceDone,
  });

  const skinColor = shiftHue(color, skinHueShift);
  const skinColorInvert = shiftHue(color, -skinHueShift);

  const skinMaterial = useShaderMaterial(skinColor, skinColorInvert, 0);
  const tongueMaterial = useShaderMaterial(
    skinColorInvert,
    skinColor,
    stripesType,
  );

  const tuftColor = shiftHue(color, tuftHueShift);
  const eyebrowColor = shiftHue(color, -tuftHueShift);

  const rotationYRef = useRef(0);
  const saltoPhaseRef = useRef(0);
  const saltoRotXRef = useRef(0);
  const saltoRotZRef = useRef(0);

  useThrottledFrame(({ camera }, delta) => {
    if (!lookAroundRef.current) return;

    const dampTo = (current, target) =>
      MathUtils.damp(current, target, dampLambda, delta);

    const nearestFullRotation = (value) =>
      Math.round(value / (Math.PI * 2)) * (Math.PI * 2);

    const isSpinPaused = selectedLanguage && !isPlaying;

    if (isSpinPaused) {
      rotationYRef.current = dampTo(
        rotationYRef.current,
        nearestFullRotation(rotationYRef.current),
      );
    } else if (selectedLanguage) {
      rotationYRef.current =
        (rotationYRef.current + delta * spin) % (Math.PI * 2);
      saltoPhaseRef.current =
        (saltoPhaseRef.current + delta * spin * saltoFrequency) % (Math.PI * 2);

      const shiftedPhase = saltoPhaseRef.current - Math.PI;
      const sinPhase = Math.sin(shiftedPhase);
      const cosPhase = Math.cos(shiftedPhase);
      if (wordOrderFlexibility !== "rigid")
        saltoRotZRef.current =
          Math.sign(sinPhase) *
          Math.pow(Math.abs(cosPhase), saltoPow) *
          saltoAmplitude *
          Math.PI;

      if (wordOrderFlexibility === "flexible")
        saltoRotXRef.current =
          Math.sign(cosPhase) *
          Math.pow(Math.abs(sinPhase), saltoPow) *
          saltoAmplitude *
          Math.PI;
    } else {
      rotationYRef.current =
        (rotationYRef.current + delta * spin) % (Math.PI * 2);
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

  return (
    <a.group
      ref={groupRef}
      position-x={spring.x}
      position-y={spring.y}
      position-z={spring.z}
      scale={spring.scale}
    >
      <group ref={lookAroundRef} scale={stanisavSize}>
        <Eyes
          irisColor={color}
          eyelidColor={skinColor}
          evidentiality={scores.evidentiality}
          verbAspect={scores.verbAspect}
          isoCode={selectedLanguage}
        />

        <Ears
          earMaterial={skinMaterial}
          morphologyScore={scores.morphology}
          isLuka={isCurrentSampleLuka}
        />

        <Tongue tongueMaterial={tongueMaterial} />

        <Nose
          position={[0, eyeY - eyeSize, eyeZ]}
          scale={noseSize}
          color={color}
          wordOrder={wordOrder}
        />

        <Teeth toothCount={phonemeCount} />

        {caseCount && (
          <Moustache
            tuftCount={caseCount}
            color={tuftColor}
            y={tuftY}
            z={eyeZ}
            stepDeg={6}
          />
        )}

        {nounClassCount && (
          <Moustache
            tuftCount={nounClassCount}
            color={eyebrowColor}
            y={eyebrowY}
            z={eyeZ}
            stepDeg={12}
          />
        )}
      </group>
    </a.group>
  );
};

export default Stanisav;
