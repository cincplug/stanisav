import { useRef, useMemo } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAudioData } from "../../hooks/useAudioData.js";
import { useHighlightMaterial } from "../../hooks/useShaderMaterial.js";
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

  const { controls } = useControls();
  const { audioData } = useAudioData();
  const { eyeZ, eyeX, moustacheSize } = controls;
  const highlightMaterial = useHighlightMaterial(0, 2);

  const tuftSurface = useMemo(
    () => createTuftShape(moustacheSize, tuftCount),
    [moustacheSize, tuftCount],
  );

  const tuftsWithRotation = useMemo(() => {
    if (!tuftCount) return [];

    const spacing = (eyeX / tuftCount) * 3;
    const totalWidth = spacing * (tuftCount - 1);
    const baseX = totalWidth / 2;
    const baseZ = eyeZ;
    const centerIndex = (tuftCount - 1) / 2;

    const result = Array.from({ length: tuftCount }, (_, i) => {
      const offsetFromCenter = Math.abs(i - centerIndex);
      const t = centerIndex === 0 ? 0 : offsetFromCenter / centerIndex;
      const scale = 0.5 + 0.5 * t;
      const rotationRad = ((180 + (i - centerIndex) * stepDeg) * Math.PI) / 180;

      return { key: `moustache-${i}`, x: baseX - i * spacing, y, z: baseZ + z, rotationRad, scale };
    });

    tuftDataRef.current = result;
    return result;
  }, [tuftCount, eyeX, eyeZ, y, z]);

  useFrame(() => {
    const audioBandData = audioData[audioBand];

    tuftsRef.current.forEach((tuftGroup, i) => {
      if (!tuftGroup) return;
      const tuft = tuftDataRef.current[i];
      const bandIndex = Math.floor(
        (Math.abs(Math.cos((i / tuftCount) * Math.PI * 2)) * audioBandData.length) / tuftCount,
      );
      const amplitude = audioBandData[bandIndex];
      const scale = moustacheSize + amplitude;

      tuftGroup.position.z = tuft.z + moustacheSize + amplitude;
      tuftGroup.scale.set(scale, scale, scale);
    });
  });

  if (!tuftsWithRotation.length) return null;

  const moustacheColor = shiftHue(color, 90);

  return (
    <>
      {tuftsWithRotation.map((tuft, i) => (
        <group
          key={tuft.key}
          ref={(el) => (tuftsRef.current[i] = el)}
          position={[tuft.x, tuft.y, tuft.z]}
          onClick={onClick}
        >
          <mesh rotation={[0, 0, tuft.rotationRad]} scale={tuft.scale} linguisticProperty={linguisticProperty}>
            <parametricGeometry args={[tuftSurface, 12, 12]} />
            {isSelected
              ? <shaderMaterial args={[highlightMaterial]} />
              : <meshStandardMaterial color={moustacheColor} side={2} />
            }
          </mesh>
        </group>
      ))}
    </>
  );
};

export default MeshaMoustache;
