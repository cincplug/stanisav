import { useRef, useMemo } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";

extend({ ParametricGeometry });

const Mesha = ({ color, labelSize, languageCode }) => {
  const groupRef = useRef();

  const { selectedLanguage } = useLanguageSelection();
  const isThisLanguageSelected = selectedLanguage === languageCode;
  const [xx, yy, zz] = languageCode
    .toLowerCase()
    .split("")
    .map((letter) => (letter.charCodeAt(0) - "a".charCodeAt(0)) / 10);

  const { audioData } = useAudioAnimation(languageCode, isThisLanguageSelected);

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
        const balancedHarmonics = harmonicsAmplitude * zz;
        const totalAmplitude = balancedFundamental + balancedHarmonics;
        const verticalVariation =
          Math.sin(v * Math.PI * 2) * verticalVariationMultiplier;
        const baseDeformation = totalAmplitude * maxDeformation * size * yy;
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
      {/* Point light from center - creates internal glow */}
      <pointLight
        position={[xx, 1, 0]}
        intensity={100 - yy}
        distance={10}
        color={color}
      />

      {/* Ambient fill light - illuminates all surfaces */}
      <pointLight
        position={[-xx, 1, zz]}
        intensity={yy}
        distance={10}
        color={color}
      />

      <mesh position={[0, 0, thickness]} scale={[2, 1, 2]}>
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color="#44aadd" side={2} />
      </mesh>

      <mesh position={[0, 0, -thickness]} scale={[-2, -1, -2]}>
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color="#dd44aa" side={2} />
      </mesh>

      <mesh position={[0, 0, 0]} scale={[-1, 1, 0]}>
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color={"#ddaa44"} side={2} />
      </mesh>

      <mesh position={[0, -1, -thickness]} scale={[2, -1, 0.5]}>
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color={color} side={2} />
      </mesh>
    </group>
  );
};

export default Mesha;
