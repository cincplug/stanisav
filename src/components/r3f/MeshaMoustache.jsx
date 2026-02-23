import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { shiftHue } from "../../utils/colorUtils";
import { defaultAudioData } from "../../config/meshaDefaultAudioData.js";

const MeshaMoustache = ({ moustacheCount, color }) => {
  const casesRef = useRef([]);
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

  const cases = useMemo(() => {
    const count = moustacheCount;
    if (!count) return [];

    const spacing = (eyeX * 4) / count;
    const totalWidth = spacing * (count - 1);
    const startX = totalWidth / 2;
    const mainZ = meshaSize * eyeZ;
    const items = [];

    for (let i = 0; i < count; i++) {
      items.push({
        x: startX - i * spacing,
        y: 1 / 2,
        z: mainZ,
        key: `case-${i}`,
      });
    }
    return items;
  }, [moustacheCount, eyeX, eyeZ, meshaSize]);

  useFrame(() => {
    if (casesRef.current && audioData.isActive) {
      const { harmonicsData } = audioData;
      const count = casesRef.current.length;
      const bandDivisor = 6;

      casesRef.current.forEach((caseGroup, i) => {
        if (caseGroup) {
          const angle = (i / count) * Math.PI * 2;
          const xSymmetry = Math.abs(Math.cos(angle));
          const bandIndex = Math.floor(
            (xSymmetry * harmonicsData.length) / bandDivisor,
          );
          const amplitude = harmonicsData[bandIndex];
          const baseY = cases[i].y;

          caseGroup.position.y = baseY + amplitude * 2;
          const scale = 0.3 + amplitude;
          caseGroup.scale.set(scale, scale, scale);
        }
      });
    }
  });

  if (!cases.length) return null;

  const moustacheColor = shiftHue(color, 90);

  return (
    <>
      {cases.map((caseItem, i) => (
        <group
          key={caseItem.key}
          ref={(el) => (casesRef.current[i] = el)}
          position={[caseItem.x, caseItem.y, caseItem.z]}
        >
          <mesh rotation={[Math.PI, Math.PI, 0]}>
            <sphereGeometry args={[moustacheSize, 16, 16]} />
            <meshStandardMaterial color={moustacheColor} />
          </mesh>
        </group>
      ))}
    </>
  );
};

export default MeshaMoustache;
