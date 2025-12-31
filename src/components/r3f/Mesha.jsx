import { useRef, useMemo } from "react";
import { Color } from "three";
import { extend, useFrame } from "@react-three/fiber";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { useControls } from "../../contexts/ControlsContext.jsx";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";
import MeshaEye from "./MeshaEye.jsx";

extend({ ParametricGeometry });

const Mesha = ({ color, labelSize, languageCode, labelText }) => {
  const groupRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const mesh1Ref = useRef();
  const mesh2Ref = useRef();

  const { selectedLanguage } = useLanguageSelection();
  const isThisLanguageSelected = selectedLanguage === languageCode;
  const { controls } = useControls();

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
      symmetricalMirroring,
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

    // Calculate average Y position from the two meshes
    if (
      mesh1Ref.current &&
      mesh2Ref.current &&
      leftEyeRef.current &&
      rightEyeRef.current
    ) {
      const geometry1 = mesh1Ref.current.geometry;
      const geometry2 = mesh2Ref.current.geometry;

      if (geometry1 && geometry2) {
        geometry1.computeBoundingBox();
        geometry2.computeBoundingBox();

        const maxY1 = geometry1.boundingBox.max.y * mesh1Ref.current.scale.y;
        const maxY2 = geometry2.boundingBox.max.y * mesh2Ref.current.scale.y;
        const avgY = (maxY1 + maxY2) / 2 + controls.eyeYOffset;

        leftEyeRef.current.position.y = avgY;
        rightEyeRef.current.position.y = avgY;
      }
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
  const thickness = 0;

  return (
    <group ref={groupRef}>
      <mesh
        ref={mesh1Ref}
        position={[1, 1, thickness]}
        scale={[1 / 2, 2 / 3, 3]}
        rotation={[0, 1 / 20, 0]}
      >
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color={c1} side={2} />
      </mesh>

      <mesh
        ref={mesh2Ref}
        position={[-1, 1, thickness]}
        scale={[-1 / 2, 3 / 4, 3]}
        rotation={[0, -1 / 20, 0]}
      >
        <parametricGeometry args={[audioReactiveSurface, segments, segments]} />
        <meshStandardMaterial color={c2} side={2} />
      </mesh>

      <group
        ref={leftEyeRef}
        position={[
          controls.eyeXPosition,
          1,
          thickness + labelSize * controls.eyeZPositionMultiplier,
        ]}
      >
        <MeshaEye position={[0, 0, 0]} color={color} labelSize={labelSize} />
      </group>

      <group
        ref={rightEyeRef}
        position={[
          -controls.eyeXPosition,
          1,
          thickness + labelSize * controls.eyeZPositionMultiplier,
        ]}
      >
        <MeshaEye position={[0, 0, 0]} color={color} labelSize={labelSize} />
      </group>

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
