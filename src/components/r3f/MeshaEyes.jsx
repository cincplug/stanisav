import { useRef } from "react";
import blinkTimings from "../../config/blinkTimings.json";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useEntrance } from "../../contexts/EntranceContext.jsx";
import { usePlaylist } from "../../contexts/PlaylistContext.jsx";
import {
  useHighlightMaterial,
  useShaderMaterial,
} from "../../hooks/useShaderMaterial.js";
import { useThrottledFrame } from "../../hooks/useThrottledFrame.js";
import { config } from "../../modules/configStore";

const Eye = ({
  position,
  irisColor,
  eyelidColor,
  size,
  depth,
  eyeSize,
  eyeProtrusion,
  blinkStateRef,
  onClick,
  isSelectedOuter,
  isSelectedInner,
  highlightMaterial,
}) => {
  const lidPivotRef = useRef();
  const groupRef = useRef();

  const irisSize = eyeSize * 0.75;
  const pupilSize = eyeSize * 0.5;
  const eyeScale = 1 + size / 4;
  const depthFactor = depth / 4;
  const irisZ = eyeProtrusion / 2 + depthFactor * eyeProtrusion;
  const pupilZ = eyeProtrusion + depthFactor * eyeProtrusion;

  const { blinkDuration } = config.meshDeformation;

  const { revealedParts } = useEntrance();
  const isEntranceBlinkPhase = !revealedParts.has("nose");

  useThrottledFrame(({ camera, clock }) => {
    if (!lidPivotRef.current) return;
    const state = blinkStateRef.current;
    const time = clock.getElapsedTime();
    if (state.isBlinking) {
      const elapsed = time - state.startTime;
      const progress = elapsed / blinkDuration;

      if (isEntranceBlinkPhase) {
        if (!state.isBlinking) {
          state.isBlinking = true;
          state.startTime = time;
        }
        return;
      }

      if (progress >= 1) {
        state.isBlinking = false;
        lidPivotRef.current.rotation.x = 0;
      } else {
        const phase = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        lidPivotRef.current.rotation.x = (phase * Math.PI) / 3;
        groupRef.current.lookAt(camera.position);
      }
    } else if (Math.ceil(time) % 2 === 0) {
      groupRef.current.lookAt(camera.position);
    }
  });

  const eyelidMaterial = useShaderMaterial(eyelidColor);

  return (
    <group position={position} scale={eyeScale} ref={groupRef} renderOrder={2}>
      <mesh linguisticProperty="evidentiality" onClick={onClick}>
        <sphereGeometry args={[eyeSize, 32, 32]} />
        {isSelectedOuter ? (
          <shaderMaterial args={[highlightMaterial]} />
        ) : (
          <meshBasicMaterial
            color="#e7ebef"
            depthTest={false}
            transparent={true}
          />
        )}
      </mesh>

      <mesh
        position={[0, 0, irisZ]}
        linguisticProperty="verbAspect"
        onClick={onClick}
      >
        <sphereGeometry args={[irisSize, 32, 32]} />
        {isSelectedInner ? (
          <shaderMaterial args={[highlightMaterial]} />
        ) : (
          <meshBasicMaterial
            color={irisColor}
            depthTest={false}
            transparent={true}
          />
        )}
      </mesh>

      <mesh position={[0, 0, pupilZ]}>
        <sphereGeometry args={[pupilSize, 32, 32]} />
        <meshStandardMaterial
          color="#222222"
          metalness={0.7}
          roughness={0.4}
          depthTest={false}
          transparent={true}
        />
      </mesh>

      <group ref={lidPivotRef} position={[0, 0, eyeSize]} renderOrder={2}>
        <mesh position={[0, eyeSize / 2, 0]} scale={[1, 0.5, 1]}>
          <sphereGeometry
            args={[eyeSize, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
          <shaderMaterial
            args={[eyelidMaterial]}
            depthTest={false}
            transparent={true}
            side={0}
          />
        </mesh>
      </group>
    </group>
  );
};

const MeshaEyes = ({
  irisColor,
  eyelidColor,
  size,
  depth,
  isoCode,
  mainZ,
  onClick,
  isSelectedOuter,
  isSelectedInner,
}) => {
  const blinkStateRef = useRef({
    isBlinking: false,
    startTime: null,
    lastCheckedIndex: 0,
  });

  const { controls } = useControls();
  const { eyeSize, eyeProtrusion, eyeX, eyeY } = controls;
  const { audioRef } = usePlaylist();
  const highlightMaterial = useHighlightMaterial(0, 2);

  const timings = blinkTimings[isoCode] ?? [];

  useThrottledFrame(({ clock }) => {
    const state = blinkStateRef.current;
    const audio = audioRef.current;

    if (timings.length > 0 && audio && !audio.paused) {
      const currentTime = audio.currentTime;
      if (state.lastCheckedIndex > 0 && currentTime < timings[0]) {
        state.lastCheckedIndex = 0;
      }
      while (
        state.lastCheckedIndex < timings.length &&
        currentTime >= timings[state.lastCheckedIndex]
      ) {
        if (!state.isBlinking) {
          state.isBlinking = true;
          state.startTime = clock.getElapsedTime();
        }
        state.lastCheckedIndex++;
      }
    }
  });

  const sharedEyeProps = {
    irisColor,
    eyelidColor,
    size,
    depth,
    eyeSize,
    eyeProtrusion,
    blinkStateRef,
    onClick,
    isSelectedOuter,
    isSelectedInner,
    highlightMaterial,
  };

  return (
    <group position={[0, 0, mainZ]}>
      <Eye position={[-eyeX, eyeY, 0]} {...sharedEyeProps} />
      <Eye position={[eyeX, eyeY, 0]} {...sharedEyeProps} />
    </group>
  );
};

export default MeshaEyes;
