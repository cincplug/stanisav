import { useRef, useMemo } from "react";
import MeshaHighlight from "./MeshaHighlight.jsx";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { shiftHue } from "../../utils/colorUtils";
import { createTuftShape } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

const CENTER_DEG = 180;
const STEP_DEG = 6;
const MIN_SCALE = 0.7;
const MAX_SCALE = 1;

const MeshaMoustache = ({
  linguisticProperty,
  tuftCount,
  color,
  y,
  z,
  onClick,
  isSelected,
  audioBand,
}) => {
  const tuftsRef = useRef([]);
  const tuftDataRef = useRef([]);

  const { controls } = useControls();
  const { audioData } = useAudioAnimation();
  const { meshaSize, eyeZ, eyeX, moustacheSize } = controls;

  const tuftSurface = useMemo(
    () => createTuftShape(moustacheSize, tuftCount),
    [moustacheSize, tuftCount],
  );

  const tuftsWithRotation = useMemo(() => {
    if (!tuftCount) return [];

    const spacing = (eyeX * 4) / tuftCount;
    const totalWidth = spacing * (tuftCount - 1);
    const baseX = totalWidth / 2;
    const baseZ = meshaSize * eyeZ;
    const centerIndex = (tuftCount - 1) / 2;

    const result = Array.from({ length: tuftCount }, (_, i) => {
      const offsetFromCenter = Math.abs(i - centerIndex);
      const t = centerIndex === 0 ? 0 : offsetFromCenter / centerIndex;
      const scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * t;
      const rotationRad =
        ((CENTER_DEG + (i - centerIndex) * STEP_DEG) * Math.PI) / 180;

      return {
        key: `moustache-${i}`,
        x: baseX - i * spacing,
        y,
        z: baseZ + z,
        rotationRad,
        scale,
        t,
      };
    });

    tuftDataRef.current = result;
    return result;
  }, [tuftCount, eyeX, eyeZ, meshaSize, y, z]);

  useFrame(() => {
    const audioBandData = audioData[audioBand];

    tuftsRef.current.forEach((tuftGroup, i) => {
      if (!tuftGroup) return;
      const tuft = tuftDataRef.current[i];
      const bandIndex = Math.floor(
        (Math.abs(Math.cos((i / tuftCount) * Math.PI * 2)) *
          audioBandData.length) /
          tuftCount,
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
          <mesh
            rotation={[0, 0, tuft.rotationRad]}
            scale={tuft.scale}
            linguisticProperty={linguisticProperty}
          >
            <parametricGeometry args={[tuftSurface, 12, 12]} />
            <meshStandardMaterial color={moustacheColor} side={2} />
            {isSelected && (
              <MeshaHighlight
                geometry="parametricGeometry"
                geometryArgs={[tuftSurface, 12, 12]}
              />
            )}
          </mesh>
        </group>
      ))}
    </>
  );
};

export default MeshaMoustache;
