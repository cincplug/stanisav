import { extend } from "@react-three/fiber";
import { forwardRef, useMemo, useRef } from "react";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useConfigContext } from "../../../contexts/ConfigContext.jsx";
import { useShaderMaterial } from "../../../hooks/useShaderMaterial.js";
import { shiftHue } from "../../../utils/colorUtils.js";
import { createTuftShape } from "../../../utils/shapeUtils.js";

extend({ ParametricGeometry });

const Moustache = ({ tuftCount, color, y, z, stepDeg }) => {
  const tuftsRef = useRef([]);
  const tuftDataRef = useRef([]);

  const { config } = useConfigContext();
  const { eyeZ, eyeX, tuftSize, tuftSpacing, tuftColorStep } = config;

  const tuftSurface = useMemo(
    () => createTuftShape(tuftSize, tuftCount),
    [tuftSize, tuftCount],
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
      const scale = tuftSize / Math.pow(t + 1 / tuftCount, tuftSize / 2) + 1;
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

  if (!tuftsWithRotation.length) return null;

  return tuftsWithRotation.map((tuft, i) => (
    <Tuft
      key={tuft.key}
      ref={(el) => (tuftsRef.current[i] = el)}
      tuft={tuft}
      tuftSurface={tuftSurface}
      color={shiftHue(color, i * tuftColorStep)}
    />
  ));
};

const Tuft = forwardRef(({ tuft, tuftSurface, color }, ref) => {
  const { config } = useConfigContext();
  const { segmentsMid } = config;
  const tuftMaterial = useShaderMaterial(color);

  return (
    <group ref={ref} position={[tuft.x, tuft.y, tuft.z]}>
      <mesh rotation={[0, 0, tuft.rotationRad]} scale={tuft.scale}>
        <parametricGeometry args={[tuftSurface, segmentsMid, segmentsMid]} />
        <shaderMaterial args={[tuftMaterial]} />
      </mesh>
    </group>
  );
});

export default Moustache;
