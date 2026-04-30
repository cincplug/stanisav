import { useRef, useMemo } from "react";
import MeshaHighlight from "./MeshaHighlight.jsx";
import { extend, useFrame } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import { shiftHue } from "../../utils/colorUtils";
import { createTuftShape } from "../../utils/shapeUtils.js";

extend({ ParametricGeometry });

/**
 * MeshaMoustache
 * @param {object} props
 * @param {boolean} props.isSelected - highlight if selectedProperty matches
 */
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

  const { controls } = useControls();
  const { audioData } = useAudioAnimation();
  const { meshaSize, eyeZ, eyeX, moustacheSize } = controls;

  const tuftSurface = useMemo(
    () => createTuftShape(moustacheSize, tuftCount),
    [moustacheSize, tuftCount],
  );

  const angleConfig = useMemo(() => {
    const centerDeg = 180;
    const stepDeg = 12; // fixed angle between neighboring tufts
    return { centerDeg, stepDeg };
  }, []);

  const tufts = useMemo(() => {
    if (!tuftCount) return [];

    const spacing = (eyeX * 4) / tuftCount;
    const totalWidth = spacing * (tuftCount - 1);
    const baseX = totalWidth / 2;
    const baseZ = meshaSize * eyeZ;

    return Array.from({ length: tuftCount }, (_, i) => ({
      x: baseX - i * spacing,
      y,
      z: baseZ + z,
      key: `moustache-${i}`,
    }));
  }, [tuftCount, eyeX, eyeZ, meshaSize, y, z]);

  const tuftsWithRotation = useMemo(() => {
    if (!tufts.length) return [];

    const centerIndex = (tuftCount - 1) / 2;
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
  }, [tufts, tuftCount, angleConfig]);

  useFrame(() => {
    if (tuftsRef.current) {
      const audioBandData = audioData[audioBand];
      const count = tuftsRef.current.length;
      const bandDivisor = tuftCount;

      tuftsRef.current.forEach((tuftGroup, i) => {
        if (tuftGroup) {
          const angle = (i / count) * Math.PI * 2;
          const xSymmetry = Math.abs(Math.cos(angle));
          const bandIndex = Math.floor(
            (xSymmetry * audioBandData.length) / bandDivisor,
          );
          const amplitude = audioBandData[bandIndex];
          const baseZ = tufts[i].z;

          tuftGroup.position.z = baseZ + moustacheSize + amplitude;
          const scale = moustacheSize + amplitude;
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
