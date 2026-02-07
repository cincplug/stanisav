import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";

const MeshaEye = ({ position, color, evidentialitySize, verbAspectSize }) => {
  const groupRef = useRef();
  const { controls } = useControls();
  const { eyeSize } = controls;

  const irisSize = eyeSize * controls.irisSize;
  const pupilSize = eyeSize * controls.pupilSize;
  const irisZ = eyeSize * controls.irisZ;
  const pupilZ = eyeSize * controls.pupilZ;

  return (
    <group ref={groupRef} position={position} scale={evidentialitySize}>
      <mesh>
        <sphereGeometry args={[eyeSize, 32, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, -irisZ / 3, irisZ + verbAspectSize * irisSize]}>
        <sphereGeometry args={[irisSize, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh
        position={[
          0,
          -pupilZ / 4,
          pupilZ + verbAspectSize * (irisSize + pupilSize),
        ]}
      >
        <sphereGeometry args={[pupilSize, 32, 32]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    </group>
  );
};

export default MeshaEye;
