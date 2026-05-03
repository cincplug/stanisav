import { useRef } from "react";
import MeshaHighlight from "./MeshaHighlight.jsx";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useAudioData } from "../../hooks/useAudioData.js";
import { useFrame } from "@react-three/fiber";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";

const MeshaEye = ({
  position,
  irisColor,
  eyelidMaterial,
  size,
  depth,
  onClick,
  isSelectedOuter,
  isSelectedInner,
}) => {
  const groupRef = useRef();
  const lidPivotRef = useRef();
  const blinkStateRef = useRef({ isBlinking: false, startTime: null });

  const { controls } = useControls();
  const { eyeSize, eyeProtrusion } = controls;
  const { audioData } = useAudioData();

  const irisSize = eyeSize * 0.75;
  const pupilSize = eyeSize * 0.5;

  const eyeScale = 1 + size / 4;
  const depthFactor = depth / 4;

  const irisZ = eyeProtrusion / 2 + depthFactor * eyeProtrusion;
  const pupilZ = eyeProtrusion + depthFactor * eyeProtrusion;

  const { blinkBand, blinkDuration, blinkThreshold } =
    audioVisualizationConfig.meshDeformation;

  useFrame(({ clock }) => {
    if (!lidPivotRef.current) return;

    const { harmonicsData } = audioData;
    const amplitude = harmonicsData[blinkBand];
    const state = blinkStateRef.current;

    if (amplitude > blinkThreshold * 2 && !state.isBlinking) {
      state.isBlinking = true;
      state.startTime = clock.getElapsedTime();
    }

    if (state.isBlinking) {
      const elapsed = clock.getElapsedTime() - state.startTime;
      const progress = elapsed / blinkDuration;

      if (progress >= 1) {
        state.isBlinking = false;
        lidPivotRef.current.rotation.x = 0;
      } else {
        const phase = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        lidPivotRef.current.rotation.x = (phase * Math.PI) / 3;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} scale={eyeScale}>
      {/* White of eye */}
      <mesh linguisticProperty="evidentiality" onClick={onClick}>
        <sphereGeometry args={[eyeSize, 32, 32]} />
        <meshStandardMaterial color="#e7ebef" />
        {isSelectedOuter && (
          <MeshaHighlight
            geometry="sphereGeometry"
            geometryArgs={[eyeSize, 32, 32]}
          />
        )}
      </mesh>

      {/* Iris */}
      <mesh
        position={[0, 0, irisZ]}
        linguisticProperty="verbAspect"
        onClick={onClick}
      >
        <sphereGeometry args={[irisSize, 32, 32]} />
        <meshStandardMaterial color={irisColor} />
        {isSelectedInner && (
          <MeshaHighlight
            geometry="sphereGeometry"
            geometryArgs={[irisSize, 32, 32]}
          />
        )}
      </mesh>

      {/* Pupil */}
      <mesh position={[0, 0, pupilZ]}>
        <sphereGeometry args={[pupilSize, 32, 32]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Eyelid */}
      <group ref={lidPivotRef} position={[0, -eyeSize / 2, 0]}>
        <mesh
          position={[0, eyeSize, eyeSize * eyeProtrusion * 2]}
          renderOrder={1}
          rotation={[Math.PI * 2, 0, 0]}
          scale={[1, 0.5, 1]}
        >
          <sphereGeometry
            args={[eyeSize, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
          <shaderMaterial args={[eyelidMaterial]} />
        </mesh>
      </group>
    </group>
  );
};

export default MeshaEye;
