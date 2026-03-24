import { useRef } from "react";
import MeshaHighlight from "./MeshaHighlight.jsx";
import { useControls } from "../../contexts/ControlsContext.jsx";

const MeshaEye = ({
  position,
  color,
  sizeSignal,
  depthSignal,
  onShowTooltip,
  isSelected,
}) => {
  const groupRef = useRef();
  const { controls } = useControls();
  const { eyeSize, eyeProtrusion } = controls;

  const irisSize = eyeSize * 0.75;
  const pupilSize = eyeSize * 0.5;

  const eyeScale = 1 + sizeSignal / 4;
  const depthFactor = depthSignal / 4;

  const irisZ = eyeProtrusion / 2 + depthFactor * eyeProtrusion;
  const pupilZ = eyeProtrusion + depthFactor * eyeProtrusion;

  return (
    <group
      ref={groupRef}
      position={position}
      scale={eyeScale}
      onClick={onShowTooltip}
    >
      <mesh meshaPart="eye">
        <sphereGeometry args={[eyeSize, 32, 32]} />
        <meshStandardMaterial color="#ffffff" />
        {isSelected && (
          <MeshaHighlight
            geometry="sphereGeometry"
            geometryArgs={[eyeSize, 32, 32]}
          />
        )}
      </mesh>
      <mesh position={[0, 0, irisZ]}>
        <sphereGeometry args={[irisSize, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0, pupilZ]}>
        <sphereGeometry args={[pupilSize, 32, 32]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    </group>
  );
};

export default MeshaEye;
