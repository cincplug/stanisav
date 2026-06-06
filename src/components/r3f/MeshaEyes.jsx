import { useRef } from "react";
import blinkTimings from "../../config/blinkTimings.json";
import { dragBindings } from "../../config/dragBindings.js";
import { useControlsContext } from "../../contexts/ControlsContext.jsx";
import { useEntranceContext } from "../../contexts/EntranceContext.jsx";
import { usePlaylistContext } from "../../contexts/PlaylistContext.jsx";
import { useMeshaDrag } from "../../hooks/useMeshaDrag.js";
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
  evidentiality,
  verbAspect,
  eyeSize,
  eyeProtrusion,
  blinkStateRef,
  onClick,
  isSelectedOuter,
  isSelectedInner,
  highlightMaterial,
  dragHandlers,
}) => {
  const lidPivotRef = useRef();
  const groupRef = useRef();

  const {
    blinkDuration,
    eyelidWidth,
    eyelidHeight,
    eyelidDepth,
    irisSize,
    pupilSize,
    pupilMetalness,
    pupilRoughness,
    segments,
  } = config.meshaVisualization;

  const irisScale = eyeSize * irisSize;
  const pupilScale = eyeSize * pupilSize;
  const eyeScale = 1 + evidentiality / 4;
  const depthFactor = verbAspect / 4;
  const irisZ = eyeProtrusion / 2 + depthFactor * eyeProtrusion;
  const pupilZ = eyeProtrusion + depthFactor * eyeProtrusion;

  const { revealedParts } = useEntranceContext();
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
        groupRef.current.lookAt(camera.position);
      } else {
        const phase = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        lidPivotRef.current.rotation.x = (phase * Math.PI) / 3;
      }
    } else if (Math.ceil(time) % 2 === 0) {
      groupRef.current.lookAt(camera.position);
    }
  });

  const eyelidMaterial = useShaderMaterial(eyelidColor);

  return (
    <group
      position={position}
      scale={eyeScale}
      ref={groupRef}
      renderOrder={2}
      {...dragHandlers()}
    >
      <mesh linguisticProperty="evidentiality" onClick={onClick}>
        <sphereGeometry args={[eyeSize, segments, segments]} />
        {isSelectedOuter ? (
          <shaderMaterial args={[highlightMaterial]} />
        ) : (
          <meshBasicMaterial wireframe color={config.colors.white} />
        )}
      </mesh>

      <mesh
        position={[0, 0, irisZ]}
        linguisticProperty="verbAspect"
        onClick={onClick}
      >
        <sphereGeometry args={[irisScale, segments, segments]} />
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
        <sphereGeometry args={[pupilScale, segments, segments]} />
        <meshStandardMaterial
          color={config.colors.labelTextColor}
          metalness={pupilMetalness}
          roughness={pupilRoughness}
          depthTest={false}
          transparent={true}
        />
      </mesh>

      <group ref={lidPivotRef} position={[0, 0, eyeSize]} renderOrder={2}>
        <mesh
          position={[0, eyeSize / 2, 0]}
          scale={[eyelidWidth, eyelidHeight, eyelidDepth]}
        >
          <sphereGeometry
            args={[
              eyeSize,
              segments,
              segments / 3,
              0,
              Math.PI * 2,
              0,
              Math.PI / 2,
            ]}
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
  evidentiality,
  verbAspect,
  isoCode,
  onClick,
  isSelectedOuter,
  isSelectedInner,
}) => {
  const blinkStateRef = useRef({
    isBlinking: false,
    startTime: null,
    lastCheckedIndex: 0,
  });

  const { controls } = useControlsContext();
  const { eyeSize, eyeProtrusion, eyeX, eyeY, eyeZ } = controls;
  const { audioRef } = usePlaylistContext();
  const highlightMaterial = useHighlightMaterial(0, 2);
  const timings = blinkTimings[isoCode] ?? [];

  const bind = useMeshaDrag(dragBindings.eyes);

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
    evidentiality,
    verbAspect,
    eyeSize,
    eyeProtrusion,
    blinkStateRef,
    onClick,
    isSelectedOuter,
    isSelectedInner,
    highlightMaterial,
    dragHandlers: bind,
  };

  return (
    <group>
      <Eye position={[-eyeX, eyeY, eyeZ]} {...sharedEyeProps} />
      <Eye position={[eyeX, eyeY, eyeZ]} {...sharedEyeProps} />
    </group>
  );
};

export default MeshaEyes;
