import { useRef } from "react";
import { MathUtils } from "three";
import { dragBindings } from "../../config/dragBindings.js";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useMeshaDrag } from "../../hooks/useMeshaDrag.js";
import {
  useHighlightMaterial,
  useShaderMaterial,
} from "../../hooks/useShaderMaterial.js";

const ROLE_ARC = {
  S: { isFullCircle: false, gapAngle: 0 },
  V: { isFullCircle: false, gapAngle: Math.PI / 2 },
  O: { isFullCircle: true, gapAngle: 0 },
};

const MeshaNose = ({
  position,
  scale,
  wordOrder,
  color,
  onClick,
  isSelectedOuter,
  isSelectedInner,
}) => {
  const groupRef = useRef();
  const highlightMaterial = useHighlightMaterial(0, 2);

  const { config } = useConfigContext();
  const {
    segments,
    noseSize,
    noseThickness,
    noseSliceAngle,
    nosePadding,
    white,
    labelTextColor,
  } = config;

  const bind = useMeshaDrag(dragBindings.nose, "wordOrder");

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

  const isSelected = [isSelectedOuter, isSelectedInner, isSelectedInner];
  const linguisticProps = ["wordOrder"];

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      renderOrder={2}
      {...bind()}
    >
      {rings.map(({ arc, rotZ, torusR, material }, i) => (
        <mesh
          key={i}
          rotation-z={rotZ}
          position={[0, 0, (i + 1) / rings.length]}
          linguisticProperty={linguisticProps[i]}
          onClick={i < 2 ? onClick : undefined}
        >
          <torusGeometry args={[torusR, tubeRadius, segments, segments, arc]} />
          {isSelected[i] ? (
            <shaderMaterial args={[highlightMaterial]} />
          ) : (
            <shaderMaterial args={[material]} />
          )}
        </mesh>
      ))}
    </group>
  );
};

export default MeshaNose;
