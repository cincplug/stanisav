import { useRef, useMemo } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { shiftHue } from "../../utils/colorUtils";
import { defaultAudioData } from "../../config/meshaDefaultAudioData.js";
import { createTuftShape } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

const MeshaMoustache = ({
  moustacheCount,
  color,
  y,
  z,
  onShowTooltip,
  selected,
}) => {
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
    () => createTuftShape(moustacheSize, moustacheCount),
    [moustacheSize],
  );

  const angleConfig = useMemo(() => {
    const centerDeg = 180;
    const stepDeg = 12; // fixed angle between neighboring tufts
    return { centerDeg, stepDeg };
  }, []);

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
  }, [moustacheCount, eyeX, eyeZ, meshaSize, y, z]);

  const tuftsWithRotation = useMemo(() => {
    if (!tufts.length) return [];

    const centerIndex = (moustacheCount - 1) / 2;
    const minScale = 0.5; // scale at center
    const maxScale = 1; // scale at edges

    return tufts.map((tuft, i) => {
      const offsetFromCenter = Math.abs(i - centerIndex);
      const t = centerIndex === 0 ? 0 : offsetFromCenter / centerIndex; // 0 at center, 1 at edge
      const scale = minScale + (maxScale - minScale) * t;
      const deg =
        (angleConfig.centerDeg +
          (i - centerIndex) * angleConfig.stepDeg +
          360) %
        360;
      const rotationRad = (deg * Math.PI) / 180;
      return { ...tuft, rotationRad, scale };
    });
  }, [tufts, moustacheCount, angleConfig]);

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

          tuftGroup.position.y = baseY + amplitude / moustacheCount;
          const scale = 0.3 + amplitude;
          tuftGroup.scale.set(scale, scale, scale);
        }
      });
    }
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
          onPointerDown={(e) => {
            e.stopPropagation();
            onShowTooltip?.();
          }}
          userData={{ isMeshaPart: true }}
        >
          <mesh rotation={[0, 0, tuft.rotationRad]} scale={tuft.scale}>
            <parametricGeometry args={[tuftSurface, 12, 12]} />
            <meshStandardMaterial color={moustacheColor} side={2} />
            {selected && (
              <mesh position={[0, 0, 0]}>
                <parametricGeometry args={[tuftSurface, 12, 12]} />
                <meshBasicMaterial color="#ff0" wireframe />
              </mesh>
            )}
          </mesh>
        </group>
      ))}
    </>
  );
};

export default MeshaMoustache;
