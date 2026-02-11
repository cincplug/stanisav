import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { useAppState } from "../../contexts/AppStateContext";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { shiftHue } from "../../utils/colorUtils";
import { defaultAudioData } from "../../config/meshaDefaultAudioData.js";

const MeshaMoustache = ({ languageCode }) => {
  const casesRef = useRef([]);
  const lastAudioDataRef = useRef(defaultAudioData);

  const { controls } = useControls();
  const { groupColors } = useLanguageSelection();
  const { data } = useAppState();
  const { audioData: rawAudioData } = useAudioAnimation();

  const { meshaSize, eyeZ, eyeX, moustacheSize } = controls;

  const linguisticProperties = data?.typologicalFeatures?.[languageCode];
  const meshaGroupKey =
    data?.languageData?.[languageCode]?.group ||
    data?.languageGroups?.[languageCode];
  const color = groupColors?.[meshaGroupKey];

  let audioData;
  if (rawAudioData.isActive) {
    audioData = rawAudioData;
    lastAudioDataRef.current = rawAudioData;
  } else {
    audioData = lastAudioDataRef.current;
  }

  const cases = useMemo(() => {
    const count = linguisticProperties?.caseCount;
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
  }, [linguisticProperties?.caseCount, eyeX, eyeZ, meshaSize]);

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
          const amplitude = harmonicsData[bandIndex] || 0;
          const baseY = cases[i]?.y || -1;
          caseGroup.position.y = baseY + amplitude * 2;
          const scale = 0.3 + amplitude;
          caseGroup.scale.set(scale, scale, scale);
        }
      });
    }
  });

  if (!cases.length) return null;

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
            <meshStandardMaterial color={shiftHue(color, 90)} />
          </mesh>
        </group>
      ))}
    </>
  );
};

export default MeshaMoustache;
