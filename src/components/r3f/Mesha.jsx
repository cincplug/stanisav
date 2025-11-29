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
    .map((c) => (c.charCodeAt(0) - 100) / 10 + 1);

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
        const verticalVariation =
          Math.sin(v * Math.PI * 2) * verticalVariationMultiplier;

        const uForBand = symmetricalMirroring && u > 0.5 ? 1 - u : u;
        const bandIndex = Math.floor(uForBand * (frequencyBands - 1));

        const fundamentalAmplitude = fundamentalData[bandIndex] || 0;
        const harmonicsAmplitude = harmonicsData[bandIndex] || 0;

        const balancedFundamental = fundamentalAmplitude * fundamentalAmplifier;
        const harmonicsModifier =
          symmetricalMirroring && u > 0.5 ? harmonicsAmplifier : zz;
        const balancedHarmonics = harmonicsAmplitude * harmonicsModifier;
        const totalAmplitude = balancedFundamental + balancedHarmonics;

        y = totalAmplitude * maxDeformation * size * yy;

        if (symmetricalMirroring && u > 0.5) {
          y *= 1 + verticalVariation;
        }
      }

      target.set(x, y, z);
    };
  };

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
      <pointLight
        position={[xx, 1, 0]}
        intensity={100 - yy}
        distance={10}
        color={color}
      />

      <pointLight
        position={[-xx, 2, zz]}
        intensity={yy}
        distance={10}
        color={color}
      />

      <mesh position={[0, 0, thickness]} scale={[2, 1, 2]}>
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color="#44aadd" side={2} />
      </mesh>

      <mesh position={[0, 0, -thickness]} scale={[-2, -1, -1]}>
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color="#dd44aa" side={2} />
      </mesh>

      <mesh position={[0, 0, -thickness * 2]} scale={[-2, 1 / 2, 3]}>
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color={"#ddaa44"} side={2} />
      </mesh>

      <mesh position={[0, 1, -thickness]} scale={[2, -1, -1]}>
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color={color} side={2} />
      </mesh>
    </group>
  );
};

export default Mesha;
