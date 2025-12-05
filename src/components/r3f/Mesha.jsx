import { useRef, useMemo } from "react";
import { Color } from "three";
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
  const c1 = new Color(color);
  const c2 = new Color("#ddddff").sub(c1);
  const c3 = new Color("#ffbbbb").sub(c1);
  const c4 = new Color("#aaffaa").sub(c1);

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
      let y = yy;

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

        y = totalAmplitude * maxDeformation * size;

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
  const thickness = 2.7;

  return (
    <group ref={groupRef}>
      <pointLight
        position={[xx / 2, 3, 2]}
        intensity={20}
        distance={10}
        color={c2}
      />

      <pointLight
        position={[-xx / 2, 0, 2]}
        intensity={20}
        distance={10}
        color={c1}
      />

      <mesh
        position={[1, 1, thickness]}
        scale={[1 / 2, 2 / 3, 3]}
        rotation={[0, 1 / 20, 0]}
      >
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color={c1} side={2} />
      </mesh>

      <mesh
        position={[-1, 1, thickness]}
        scale={[-1 / 2, 3 / 4, 3]}
        rotation={[0, -1 / 20, 0]}
      >
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color={c2} side={2} />
      </mesh>

      <mesh
        position={[0, -1, -thickness]}
        scale={[-2, -1 / 2, -2]}
        rotation={[0, 1, 0]}
      >
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color={c3} side={2} />
      </mesh>

      <mesh
        position={[0, -1, -thickness]}
        scale={[-2, -1 / 2, -2]}
        rotation={[0, -1, 0]}
      >
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color={c4} side={2} />
      </mesh>
    </group>
  );
};

export default Mesha;
