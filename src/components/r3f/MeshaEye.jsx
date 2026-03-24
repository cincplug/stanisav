import { useRef } from "react";
import MeshaHighlight from "./MeshaHighlight.jsx";
import { useControls } from "../../contexts/ControlsContext.jsx";

const MeshaEye = ({
  position,
  color,
  sizeSignal,
  depthSignal,
  onClick,
  isSelectedOuter,
  isSelectedInner,
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
    <group ref={groupRef} position={position} scale={eyeScale}>
      <mesh linguisticProperty="evidentiality" onClick={onClick}>
        <sphereGeometry args={[eyeSize, 32, 32]} />
        <meshStandardMaterial color="#ffffff" />
        {isSelectedOuter && (
          <MeshaHighlight
            geometry="sphereGeometry"
            geometryArgs={[eyeSize, 32, 32]}
          />
        )}
      </mesh>
      <mesh
        position={[0, 0, irisZ]}
        linguisticProperty="verbAspect"
        onClick={onClick}
      >
        <sphereGeometry args={[irisSize, 32, 32]} />
        <meshStandardMaterial color={color} />
        {isSelectedInner && (
          <MeshaHighlight
            geometry="sphereGeometry"
            geometryArgs={[irisSize, 32, 32]}
          />
        )}
      </mesh>
      <mesh position={[0, 0, pupilZ]}>
        <sphereGeometry args={[pupilSize, 32, 32]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    </group>
  );
};

export default MeshaEye;
