import { extend } from "@react-three/fiber";
import { forwardRef, useMemo, useRef } from "react";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { dragBindings } from "../../config/dragBindings.js";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useAudioData } from "../../hooks/useAudioData.js";
import { useMeshaDrag } from "../../hooks/useMeshaDrag.js";
import {
  useHighlightMaterial,
  useShaderMaterial,
} from "../../hooks/useShaderMaterial.js";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { shiftHue } from "../../utils/colorUtils";
import { createTuftShape } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

const MeshaTuft = forwardRef(
  (
    { tuft, tuftSurface, color, isSelected, linguisticProperty, onClick },
    ref,
  ) => {
    const { config } = useConfigContext();
    const { segments } = config.meshaVisualization;
    const tuftMaterial = useShaderMaterial(color);
    const highlightMaterial = useHighlightMaterial(0, 2);

    return (
      <group ref={ref} position={[tuft.x, tuft.y, tuft.z]} onClick={onClick}>
        <mesh
          rotation={[0, 0, tuft.rotationRad]}
          scale={tuft.scale}
          linguisticProperty={linguisticProperty}
        >
          <parametricGeometry args={[tuftSurface, segments, segments]} />
          {isSelected ? (
            <shaderMaterial args={[highlightMaterial]} />
          ) : (
            <shaderMaterial args={[tuftMaterial]} />
          )}
        </mesh>
      </group>
    );
  },
);

const MeshaMoustache = ({
  linguisticProperty,
  tuftCount,
  color,
  y,
  z,
  onClick,
  isSelected,
  audioBand,
  stepDeg,
}) => {
  const tuftsRef = useRef([]);
  const tuftDataRef = useRef([]);

  const { config } = useConfigContext();
  const {
    eyeZ,
    eyeX,
    moustacheSize,
    moustacheSpacing,
    moustacheColorStep,
    moustacheTipRadius,
  } = config.meshaVisualization;
  const { audioData } = useAudioData();
  const bind = useMeshaDrag(dragBindings.moustache, linguisticProperty);

  const tuftSurface = useMemo(
    () => createTuftShape(moustacheSize, tuftCount, moustacheTipRadius),
    [moustacheSize, tuftCount],
  );

  const tuftsWithRotation = useMemo(() => {
    if (!tuftCount) return [];
    const spacing = (eyeX / tuftCount) * moustacheSpacing;
    const totalWidth = spacing * (tuftCount - 1);
    const baseX = totalWidth / 2;
    const centerIndex = (tuftCount - 1) / 2;
    const result = Array.from({ length: tuftCount }, (_, i) => {
      const offsetFromCenter = Math.abs(i - centerIndex);
      const t = centerIndex === 0 ? 0 : offsetFromCenter / centerIndex;
      const scale = 0.5 + 0.5 * t;
      const rotationRad = ((180 + (i - centerIndex) * stepDeg) * Math.PI) / 180;
      return {
        key: `moustache-${i}`,
        x: baseX - i * spacing,
        y,
        z,
        rotationRad,
        scale,
      };
    });
    tuftDataRef.current = result;
    return result;
  }, [tuftCount, moustacheSpacing, eyeX, eyeZ, y, z]);

  useThrottledFrame(() => {
    const audioBandData = audioData[audioBand];
    tuftsRef.current.forEach((tuftGroup, i) => {
      if (!tuftGroup) return;
      const bandIndex = Math.floor(
        (Math.abs(Math.cos((i / tuftCount) * Math.PI * 2)) *
          audioBandData.length) /
          tuftCount,
      );
      const amplitude = audioBandData[bandIndex];
      const scale = moustacheSize + amplitude;
      tuftGroup.scale.set(scale, scale, scale);
    });
  });

  if (!tuftsWithRotation.length) return null;

  return (
    <group {...bind()}>
      {tuftsWithRotation.map((tuft, i) => (
        <MeshaTuft
          key={tuft.key}
          ref={(el) => (tuftsRef.current[i] = el)}
          tuft={tuft}
          tuftSurface={tuftSurface}
          color={shiftHue(color, i * moustacheColorStep)}
          isSelected={isSelected}
          linguisticProperty={linguisticProperty}
          onClick={onClick}
        />
      ))}
    </group>
  );
};

export default MeshaMoustache;
