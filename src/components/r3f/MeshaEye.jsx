import { useRef } from "react";
import { useControls } from "../../contexts/ControlsContext.jsx";

const MeshaEye = ({ position, color, evidentialitySize, verbAspectSize }) => {
  const groupRef = useRef();
  const { controls } = useControls();
  const { eyeSize, eyeProtrusion } = controls;

  const irisSize = eyeSize * 0.75;
  const pupilSize = eyeSize * 0.5;
  const irisZ = eyeProtrusion / 2 + verbAspectSize * eyeProtrusion;
  const pupilZ = eyeProtrusion + verbAspectSize * eyeProtrusion;

  return (
    <group ref={groupRef} position={position} scale={evidentialitySize}>
      <mesh>
        <sphereGeometry args={[eyeSize, 32, 32]} />
        <meshStandardMaterial color="#ffffff" />
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
