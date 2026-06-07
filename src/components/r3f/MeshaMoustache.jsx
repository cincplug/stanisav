import { extend } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { dragBindings } from "../../config/dragBindings.js";
import { useControlsContext } from "../../contexts/ControlsContext.jsx";
import { useAudioData } from "../../hooks/useAudioData.js";
import { useMeshaDrag } from "../../hooks/useMeshaDrag.js";
import { useHighlightMaterial } from "../../hooks/useShaderMaterial.js";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { config } from "../../modules/configStore";
import { shiftHue } from "../../utils/colorUtils";
import { createTuftShape } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

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
  const { tuftSpacing, tuftColorStep, segments } = config.meshaVisualization;

  const { controls } = useControlsContext();
  const { audioData } = useAudioData();
  const { eyeZ, eyeX, moustacheSize } = controls;
  const highlightMaterial = useHighlightMaterial(0, 2);

  const bind = useMeshaDrag(dragBindings.moustache, linguisticProperty);

  const tuftSurface = useMemo(
    () => createTuftShape(moustacheSize, tuftCount),
    [moustacheSize, tuftCount],
  );

  const tuftsWithRotation = useMemo(() => {
    if (!tuftCount) return [];

    const spacing = (eyeX / tuftCount) * tuftSpacing;
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
  }, [tuftCount, tuftSpacing, eyeX, eyeZ, y, z]);

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
        <group
          key={tuft.key}
          ref={(el) => (tuftsRef.current[i] = el)}
          position={[tuft.x, tuft.y, tuft.z]}
          onClick={onClick}
        >
          <mesh
            rotation={[0, 0, tuft.rotationRad]}
            scale={tuft.scale}
            linguisticProperty={linguisticProperty}
          >
            <parametricGeometry args={[tuftSurface, segments, segments]} />
            {isSelected ? (
              <shaderMaterial args={[highlightMaterial]} />
            ) : (
              <meshPhongMaterial
                color={shiftHue(color, i * tuftColorStep)}
                wireframe
                side={2}
              />
            )}
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default MeshaMoustache;
