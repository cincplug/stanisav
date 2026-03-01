import { useRef, useMemo, useEffect } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";
import microphoneService from "../../services/microphoneService.js";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useTonalityMaterial } from "../../hooks/useTonalityMaterial.js";
import { getFeatureScoreList } from "../../utils/linguisticUtils.js";
import { shiftHue } from "../../utils/colorUtils";
import MeshaEye from "./MeshaEye.jsx";
import MeshaCheek from "./MeshaCheek.jsx";
import MeshaTongue from "./MeshaTongue.jsx";
import MeshaNose from "./MeshaNose.jsx";
import MeshaTeeth from "./MeshaTeeth.jsx";
import MeshaMoustache from "./MeshaMoustache.jsx";
import MeshaLight from "./MeshaLight.jsx";

extend({ ParametricGeometry });

const Mesha = ({
  linguisticProperties,
  color,
  position,
  audioSource,
  animateFromAudio,
  tonalityType,
  looksAround,
}) => {
  const groupRef = useRef();
  const lookAroundRef = useRef();
  const eyesGroupRef = useRef();
  const lookAroundRotationRef = useRef(0); // <-- renamed from meshaRotationRef

  const { controls } = useControls();
  const { meshaSize, eyeZ, eyeX, eyeY, noseSize } = controls;

  useEffect(() => {
    const shouldCapture = animateFromAudio && !audioSource;
    if (shouldCapture) {
      microphoneService.startCapture();
    } else {
      microphoneService.stopCapture();
    }
    return () => {
      microphoneService.stopCapture();
    };
  }, [animateFromAudio, audioSource]);

  if (!color || !position) return null;

  const scores = getFeatureScoreList(linguisticProperties, [
    "wordOrderFlexibility",
    "morphology",
    "evidentiality",
    "verbAspect",
  ]);

  const { phonemeCount, caseCount, wordOrder, nounClassCount, maxClusterSize } =
    linguisticProperties;

  const noseColorMap = {
    S: "#ffffff",
    V: color,
    O: "#222222",
  };

  const noseSegmentColors = [
    noseColorMap[wordOrder[0]],
    noseColorMap[wordOrder[1]],
    noseColorMap[wordOrder[2]],
  ];
  const noseMotionIntensity = scores.wordOrderFlexibility;

  const eyeSizeSignal = scores.evidentiality;
  const eyeDepthSignal = scores.verbAspect;

  const spring = useSpring({
    position,
    scale: meshaSize,
    config: { mass: 1, tension: 120, friction: 20 },
  });

  const leftCheekMaterial = useTonalityMaterial(
    shiftHue(color, -30),
    shiftHue(color, 60),
    tonalityType,
  );
  const rightCheekMaterial = useTonalityMaterial(
    shiftHue(color, 30),
    shiftHue(color, -60),
    tonalityType,
  );
  const mouthMaterial = useTonalityMaterial(color, color, tonalityType);

  useFrame(({ camera, clock }) => {
    if (looksAround) {
      if (groupRef.current) {
        groupRef.current.lookAt(camera.position);
      }

      if (lookAroundRef.current) {
        const time = clock.getElapsedTime();
        const speed = 0.5;
        const amplitude = Math.PI / 4;

        const phase = time * speed;
        const sine = Math.sin(phase);
        const triangle = (2 / Math.PI) * Math.asin(sine);

        const linearity = 0.5;
        const wave = sine * (1 - linearity) + triangle * linearity;

        const rotation = wave * amplitude;
        lookAroundRef.current.rotation.y = rotation;
        lookAroundRotationRef.current = rotation;
      }
    }
  });

  const segments = audioVisualizationConfig.meshDeformation.meshSegments;
  const mainZ = meshaSize * eyeZ;

  const cheekPosition = useMemo(
    () => ({
      x: 1.37 - scores.morphology / 2,
      y: (scores.morphology + 1) / 4,
      z: 1,
    }),
    [scores.morphology],
  );

  return (
    <a.group ref={groupRef} position={spring.position} scale={spring.scale}>
      <group ref={lookAroundRef}>
        <MeshaCheek
          leftCheekMaterial={leftCheekMaterial}
          rightCheekMaterial={rightCheekMaterial}
          meshaSize={meshaSize}
          bend={scores.morphology / 3}
          leftSegments={10 - scores.morphology}
          rightSegments={2 + scores.morphology * 2}
          cheekPosition={cheekPosition}
        />

        <group ref={eyesGroupRef} position={[0, 1, mainZ]}>
          <MeshaEye
            position={[-eyeX, eyeY, 0]}
            color={color}
            sizeSignal={eyeSizeSignal}
            depthSignal={eyeDepthSignal}
          />
          <MeshaEye
            position={[eyeX, eyeY, 0]}
            color={color}
            sizeSignal={eyeSizeSignal}
            depthSignal={eyeDepthSignal}
          />
          <MeshaNose
            position={[0, eyeY - eyeX / 2, 0]}
            scale={noseSize}
            segmentColors={noseSegmentColors}
            motionIntensity={noseMotionIntensity}
            lookAroundRotationRef={lookAroundRotationRef}
          />
        </group>

        <MeshaTongue mouthMaterial={mouthMaterial} segments={segments} />
        <MeshaTeeth toothCount={phonemeCount} clusterSize={maxClusterSize} />
        {caseCount && (
          <MeshaMoustache
            moustacheCount={caseCount}
            color={color}
            y={meshaSize * 0.7}
            z={0.5}
          />
        )}
        {nounClassCount && (
          <MeshaMoustache
            moustacheCount={nounClassCount}
            color={shiftHue(color, 120)}
            y={meshaSize * 1.4}
            z={0}
          />
        )}
      </group>
      <MeshaLight spread={2} />
    </a.group>
  );
};

export default Mesha;
