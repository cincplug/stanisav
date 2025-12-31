import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "../../contexts/ControlsContext.jsx";

const MeshaEye = ({ position, color, labelSize }) => {
  const eyeRef = useRef();
  const { controls } = useControls();

  useFrame(({ camera }) => {
    if (eyeRef.current) {
      eyeRef.current.lookAt(camera.position);
    }
  });

  const eyeSize = labelSize * controls.eyeSizeMultiplier;
  const irisSize = eyeSize * controls.irisSizeMultiplier;
  const pupilSize = eyeSize * controls.pupilSizeMultiplier;

  return (
    <group ref={eyeRef} position={position}>
      {/* White of the eye */}
      <mesh>
        <sphereGeometry args={[eyeSize, 32, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Iris */}
      <mesh position={[0, 0, eyeSize * controls.irisZPositionMultiplier]}>
        <sphereGeometry args={[irisSize, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Pupil */}
      <mesh position={[0, 0, eyeSize * controls.pupilZPositionMultiplier]}>
        <sphereGeometry args={[pupilSize, 32, 32]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
};

export default MeshaEye;
