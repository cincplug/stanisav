import { a, useSpring } from "@react-spring/three";
import { extend } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
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

const Mesha = ({
  languageCode,
  position,
  isMyMesha,
  spin,
  isMotionReduced,
  orbitAngleRef,
  renderOrder,
}) => {
  const groupRef = useRef();
  const lookAroundRef = useRef();
  const orbitCompensationRef = useRef();

  const { data } = useAppStateContext();
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
    meshaSize,
    eyeZ,
    eyeY,
    eyeSize,
    noseSize,
    labelSize,
    isBlackboard,
    spiralAxis,
  } = config;

  const { selectedLanguage } = useLanguageSelectionContext();

  const { isMeshaSequenceDone, isEntranceComplete, onMeshaSequenceDone } =
    useEntranceContext();

  const linguisticProperties = data?.languages?.[languageCode];
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
        if (i === meshes.length - 1) onMeshaSequenceDone();
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

  const nudgeIfSelected = selectedLanguage ? labelSize / 2 : 0;

  const spring = useSpring({
    x: position[0],
    y: position[1] - nudgeIfSelected,
    z: position[2],
    scale: selectedLanguage || isBlackboard ? 1 : 2,
    config: {
      duration: isEntranceComplete ? switchDuration : entranceDuration,
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

  const tuftColor = shiftHue(color, tuftHueShift);
  const eyebrowColor = shiftHue(color, -tuftHueShift);

  const rotationYRef = useRef(0);
  const saltoPhaseRef = useRef(0);
  const saltoRotXRef = useRef(0);
  const saltoRotZRef = useRef(0);
  const orbitCompensationAngleRef = useRef(0);

  useThrottledFrame(({ camera }, delta) => {
    if (!lookAroundRef.current) return;

    const dampTo = (current, target) =>
      MathUtils.damp(current, target, dampLambda, delta);

    if (orbitCompensationRef.current) {
      const targetOrbitAngle = selectedLanguage
        ? 0
        : (orbitAngleRef?.current ?? 0);

      orbitCompensationAngleRef.current = dampTo(
        orbitCompensationAngleRef.current,
        targetOrbitAngle,
      );

      if (spiralAxis === "z") {
        orbitCompensationRef.current.rotation.z =
          orbitCompensationAngleRef.current;
        orbitCompensationRef.current.rotation.y = 0;
      } else {
        orbitCompensationRef.current.rotation.y =
          orbitCompensationAngleRef.current;
        orbitCompensationRef.current.rotation.z = 0;
      }
    }

    const nearestFullRotation = (value) =>
      Math.round(value / (Math.PI * 2)) * (Math.PI * 2);

    const isBlocked =
      isAnimating || !isEntranceComplete || (!isPlaying && !!selectedLanguage);

    if (isBlocked) {
      rotationYRef.current = dampTo(
        rotationYRef.current,
        nearestFullRotation(rotationYRef.current),
      );
    }

    if (!isBlocked) {
      rotationYRef.current =
        (rotationYRef.current + delta * spin) % (Math.PI * 2);
    }

    if (!isBlocked && selectedLanguage) {
      saltoPhaseRef.current =
        (saltoPhaseRef.current + delta * spin * saltoFrequency) % (Math.PI * 2);

      const shiftedPhase = saltoPhaseRef.current - Math.PI;
      const sinPhase = Math.sin(shiftedPhase);
      const cosPhase = Math.cos(shiftedPhase);
      if (wordOrderFlexibility !== "rigid")
        saltoRotXRef.current =
          Math.sign(cosPhase) *
          Math.pow(Math.abs(sinPhase), saltoPow) *
          saltoAmplitude *
          Math.PI;
      if (wordOrderFlexibility === "flexible")
        saltoRotZRef.current =
          Math.sign(sinPhase) *
          Math.pow(Math.abs(cosPhase), saltoPow) *
          saltoAmplitude *
          Math.PI;
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
    <group ref={orbitCompensationRef}>
      <a.group
        ref={groupRef}
        position-x={spring.x}
        position-y={spring.y}
        position-z={spring.z}
        scale={spring.scale}
      >
        <group ref={lookAroundRef} scale={meshaSize}>
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

          <Balloon
            position={selectedLanguage ? "top" : "top-right"}
            anchorOffset={
              selectedLanguage
                ? [0, eyeY + eyeSize * 2, eyeZ]
                : [0, eyeY + eyeSize * 2, eyeZ]
            }
          />
        </group>
      </a.group>
    </group>
  );
};

export default Mesha;
