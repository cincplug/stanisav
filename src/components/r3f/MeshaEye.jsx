import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";

const MeshaEye = ({ position, color, labelSize }) => {
  const groupRef = useRef();
  const { controls } = useControls();

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  const eyeSize = labelSize * controls.eyeSizeMultiplier;
  const irisSize = eyeSize * controls.irisSizeMultiplier;
  const pupilSize = eyeSize * controls.pupilSizeMultiplier;
  const irisZ = eyeSize * controls.irisZPositionMultiplier;
  const pupilZ = eyeSize * controls.pupilZPositionMultiplier;

  return (
    <group ref={groupRef} position={position}>
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
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
};

export default MeshaEye;
