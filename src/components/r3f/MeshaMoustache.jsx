import { useRef, useMemo } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { shiftHue } from "../../utils/colorUtils";
import { defaultAudioData } from "../../config/meshaDefaultAudioData.js";
import { createTuftShape } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

const MeshaMoustache = ({ moustacheCount, color, y, z }) => {
  const tuftsRef = useRef([]);
  const lastAudioDataRef = useRef(defaultAudioData);

  const { controls } = useControls();
  const { audioData: rawAudioData } = useAudioAnimation();
  const { meshaSize, eyeZ, eyeX, moustacheSize } = controls;

  const audioData = rawAudioData.isActive
    ? rawAudioData
    : lastAudioDataRef.current;

  if (rawAudioData.isActive) {
    lastAudioDataRef.current = rawAudioData;
  }

  const tuftSurface = useMemo(
    () => createTuftShape(moustacheSize),
    [moustacheSize],
  );

  const tufts = useMemo(() => {
    if (!moustacheCount) return [];

    const spacing = (eyeX * 4) / moustacheCount;
    const totalWidth = spacing * (moustacheCount - 1);
    const baseX = totalWidth / 2;
    const baseZ = meshaSize * eyeZ;

    return Array.from({ length: moustacheCount }, (_, i) => ({
      x: baseX - i * spacing,
      y,
      z: baseZ + z,
      key: `moustache-${i}`,
    }));
  }, [moustacheCount, eyeX, eyeZ, meshaSize, y]);

  useFrame(() => {
    if (tuftsRef.current && audioData.isActive) {
      const { harmonicsData } = audioData;
      const count = tuftsRef.current.length;
      const bandDivisor = 6;

      tuftsRef.current.forEach((tuftGroup, i) => {
        if (tuftGroup) {
          const angle = (i / count) * Math.PI * 2;
          const xSymmetry = Math.abs(Math.cos(angle));
          const bandIndex = Math.floor(
            (xSymmetry * harmonicsData.length) / bandDivisor,
          );
          const amplitude = harmonicsData[bandIndex];
          const baseY = tufts[i].y;

          tuftGroup.position.y = baseY + amplitude * 2;
          const scale = 0.3 + amplitude;
          tuftGroup.scale.set(scale, scale, scale);
        }
      });
    }
  });

  if (!tufts.length) return null;

  const moustacheColor = shiftHue(color, 90);

  return (
    <>
      {tufts.map((tuft, i) => (
        <group
          key={tuft.key}
          ref={(el) => (tuftsRef.current[i] = el)}
          position={[tuft.x, tuft.y, tuft.z]}
        >
          <mesh rotation={[Math.PI, Math.PI, 0]}>
            <parametricGeometry args={[tuftSurface, 24, 14]} />
            <meshStandardMaterial color={moustacheColor} />
          </mesh>
        </group>
      ))}
    </>
  );
};

export default MeshaMoustache;
