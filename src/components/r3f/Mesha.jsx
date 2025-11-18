import { useRef, useMemo } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import {
  getNodeRotation,
  getCameraFacingTilt
} from "../../utils/geometryUtils.js";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import {
  useAudioAnimation,
  useRotationAnimation
} from "../../hooks/useAudioAnimation.js";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";

extend({ ParametricGeometry });

const Mesha = ({ color, labelSize, languageCode }) => {
  const meshRef = useRef();
  const groupRef = useRef();

  const { selectedLanguage } = useLanguageSelection();
  const isThisLanguageSelected = selectedLanguage === languageCode;

  const { audioData, rotationStateRef } = useAudioAnimation(
    languageCode,
    isThisLanguageSelected
  );

  const createAudioReactiveSurface = (
    labelSize,
    isSelectedForAudio,
    audioDataValue,
    meshConfig
  ) => {
    const {
      frequencyBands,
      maxDeformation,
      fundamentalAmplifier,
      harmonicsAmplifier,
      verticalVariationMultiplier,
      symmetricalMirroring
    } = meshConfig;
    return (u, v, target) => {
      const size = labelSize;
      const z = (u - 0.5) * size;
      const x = (v - 0.5) * size;
      let y = 0;
      if (isSelectedForAudio && audioDataValue.isActive) {
        const { fundamentalData, harmonicsData } = audioDataValue;
        const bandIndex = Math.floor(u * (frequencyBands - 1));
        const fundamentalAmplitude = fundamentalData[bandIndex] || 0;
        const harmonicsAmplitude = harmonicsData[bandIndex] || 0;
        const balancedFundamental = fundamentalAmplitude * fundamentalAmplifier;
        const balancedHarmonics = harmonicsAmplitude * harmonicsAmplifier;
        const totalAmplitude = balancedFundamental + balancedHarmonics;
        const verticalVariation =
          Math.sin(v * Math.PI * 2) * verticalVariationMultiplier;
        const baseDeformation =
          totalAmplitude * maxDeformation * size * (1 + verticalVariation);
        if (symmetricalMirroring) {
          if (u <= 0.5) {
            y = baseDeformation;
          } else {
            const mirroredU = 1 - u;
            const mirroredBandIndex = Math.floor(
              mirroredU * (frequencyBands - 1)
            );
            const mirroredFundamental = fundamentalData[mirroredBandIndex] || 0;
            const mirroredHarmonics = harmonicsData[mirroredBandIndex] || 0;
            const mirroredAmplitude =
              mirroredFundamental * fundamentalAmplifier +
              mirroredHarmonics * harmonicsAmplifier;
            const mirroredDeformation =
              mirroredAmplitude *
              maxDeformation *
              size *
              (1 + verticalVariation);
            y = mirroredDeformation;
          }
        } else {
          y = baseDeformation;
        }
      }
      target.set(x, y, z);
    };
  };

  const baseRotation = useMemo(() => {
    const rotation = getNodeRotation();
    const tilt = getCameraFacingTilt();
    return [tilt, rotation[1], rotation[2]];
  }, []);

  useRotationAnimation(meshRef, baseRotation, audioData, rotationStateRef);

  // Make the group face the camera (billboarding effect)
  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  const audioReactiveSurface = useMemo(
    () =>
      createAudioReactiveSurface(
        labelSize,
        isThisLanguageSelected,
        audioData,
        audioVisualizationConfig.meshDeformation
      ),
    [labelSize, isThisLanguageSelected, audioData]
  );

  const segments = audioVisualizationConfig.meshDeformation.meshSegments;

  const thickness = 0.2;

  return (
    <group ref={groupRef}>
      {/* Original mesh */}
      <mesh ref={meshRef}>
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color={color} side={2} />
      </mesh>

      {/* Shifted copy */}
      <mesh position={[0, 0, thickness]}>
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color={color} side={2} />
      </mesh>

      {/* Flipped and shifted copy */}
      <mesh position={[0, 0, thickness]} scale={[-1, 1, 1]}>
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color={color} side={2} />
      </mesh>
    </group>
  );
};

export default Mesha;
