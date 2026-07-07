import { useRef } from "react";
import { MathUtils } from "three";
import { useConfigContext } from "../../../contexts/ConfigContext.jsx";
import { useShaderMaterial } from "../../../hooks/useShaderMaterial.js";

const ROLE_ARC = {
  S: { isFullCircle: false, gapAngle: 0 },
  V: { isFullCircle: false, gapAngle: Math.PI / 2 },
  O: { isFullCircle: true, gapAngle: 0 },
};

const Nose = ({ position, scale, wordOrder, color }) => {
  const groupRef = useRef();

  const { config } = useConfigContext();
  const {
    segmentsBig,
    noseSize,
    noseThickness,
    noseSliceAngle,
    nosePadding,
    white,
    labelTextColor,
  } = config;

  const sliceRad = MathUtils.degToRad(noseSliceAngle);
  const fullArc = Math.PI * 2;
  const tubeRadius = noseThickness / 2;

  const innerRadius = noseSize;
  const middleRadius = innerRadius + tubeRadius * 2 + nosePadding;
  const outerRadius = middleRadius + tubeRadius * 2 + nosePadding;
  const radii = [outerRadius, middleRadius, innerRadius];

  const roles = wordOrder.split("");
  const colors = { S: white, V: color, O: labelTextColor };

  const rings = roles.map((role, i) => {
    const { isFullCircle, gapAngle } = ROLE_ARC[role] ?? ROLE_ARC.O;
    const arc = isFullCircle ? fullArc : fullArc - sliceRad;
    const rotZ = isFullCircle ? 0 : gapAngle - (arc + sliceRad / 2);
    return {
      arc,
      rotZ,
      torusR: radii[i],
      material: useShaderMaterial(colors[role]),
    };
  });

  return (
    <group ref={groupRef} position={position} scale={scale} renderOrder={2}>
      {rings.map(({ arc, rotZ, torusR, material }, i) => (
        <mesh
          key={i}
          rotation-z={rotZ}
          position={[0, 0, (i + 1) / rings.length]}
        >
          <torusGeometry
            args={[torusR, tubeRadius, segmentsBig, segmentsBig, arc]}
          />
          <shaderMaterial args={[material]} />
        </mesh>
      ))}
    </group>
  );
};

export default Nose;
