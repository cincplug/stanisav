import { useRef, useMemo, useEffect } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";
import microphoneService from "../../services/microphoneService.js";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import { useShaderMaterial } from "../../hooks/useShaderMaterial.js";
import { getFeatureScoreList } from "../../utils/linguisticUtils.js";
import { shiftHue } from "../../utils/colorUtils";
import MeshaEye from "./MeshaEye.jsx";
import MeshaEar from "./MeshaEar.jsx";
import MeshaTongue from "./MeshaTongue.jsx";
import MeshaNose from "./MeshaNose.jsx";
import MeshaTeeth from "./MeshaTeeth.jsx";
import MeshaMoustache from "./MeshaMoustache.jsx";
import MeshaLight from "./MeshaLight.jsx";

extend({ ParametricGeometry });
extend({ TextGeometry });

const Mesha = ({
  linguisticProperties,
  color,
  position,
  isMyMesha,
  stripesType,
  looksAround,
  renderOrder,
  autoRotateSpeed,
}) => {
  const groupRef = useRef();
  const lookAroundRef = useRef();
  const eyesGroupRef = useRef();
  const lookAroundRotationRef = useRef(0);

  const { controls } = useControls();
  const {
    meshaSize,
    eyeZ,
    eyeX,
    eyeY,
    noseSize,
    tension,
    friction,
    globeSpiralAxis,
  } = controls;
  const { selectedProperty, setSelectedProperty } = useLanguageSelection();

  useEffect(() => {
    if (isMyMesha) {
      microphoneService.startCapture();
    } else {
      microphoneService.stopCapture();
    }
    return () => {
      microphoneService.stopCapture();
    };
  }, [isMyMesha]);

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
    S: "#e7ebef",
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
    x: position[0],
    y: position[1],
    z: position[2],
    scale: meshaSize,
    config: { tension, friction },
  });

  const earMaterial = useShaderMaterial(
    shiftHue(color, -60),
    shiftHue(color, 60),
    0,
  );

  const tongueMaterial = useShaderMaterial(
    shiftHue(color, 60),
    shiftHue(color, -60),
    stripesType,
  );

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.traverse((object) => {
        if (object.isMesh) {
          object.material.transparent = true;
          object.material.needsUpdate = true;
          object.renderOrder = object.material.isShaderMaterial
            ? renderOrder / 2
            : renderOrder;
        }
      });
    }
  }, []);

  useFrame(({ camera, clock }) => {
    if (looksAround) {
      if (groupRef.current) {
        groupRef.current.lookAt(camera.position);
      }

      if (lookAroundRef.current) {
        const time = clock.getElapsedTime();
        const speed = autoRotateSpeed / 3;
        const amplitude = Math.PI / 8;

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

  const earPosition = useMemo(
    () => ({
      x: 1.37 - scores.morphology / 2,
      y: (scores.morphology + 1) / 4,
      z: 1,
    }),
    [scores.morphology],
  );

  // Handler for click: toggle selectedProperty if part is mapped
  const handlePropertyClick = (e) => {
    e.stopPropagation();
    const prop = e.object.linguisticProperty;
    setSelectedProperty(selectedProperty === prop ? null : prop);
  };

  return (
    <a.group
      ref={groupRef}
      position-x={spring.x}
      position-y={spring.y}
      position-z={spring.z}
      scale={spring.scale}
    >
      <group ref={lookAroundRef}>
        <MeshaEar
          earMaterial={earMaterial}
          meshaSize={meshaSize}
          bend={scores.morphology / 3}
          leftSegments={10 - scores.morphology}
          rightSegments={2 + scores.morphology * 2}
          earPosition={earPosition}
          onClick={handlePropertyClick}
          isSelected={selectedProperty === "morphology"}
        />

        <group ref={eyesGroupRef} position={[0, 1, mainZ]}>
          <MeshaEye
            position={[-eyeX, eyeY, 0]}
            color={color}
            sizeSignal={eyeSizeSignal}
            depthSignal={eyeDepthSignal}
            onClick={handlePropertyClick}
            isSelectedOuter={selectedProperty === "evidentiality"}
            isSelectedInner={selectedProperty === "verbAspect"}
          />
          <MeshaEye
            position={[eyeX, eyeY, 0]}
            color={color}
            sizeSignal={eyeSizeSignal}
            depthSignal={eyeDepthSignal}
            onClick={handlePropertyClick}
            isSelectedOuter={selectedProperty === "evidentiality"}
            isSelectedInner={selectedProperty === "verbAspect"}
          />
          <MeshaNose
            position={[0, eyeY - eyeX / 2, 0]}
            scale={noseSize}
            segmentColors={noseSegmentColors}
            motionIntensity={noseMotionIntensity}
            lookAroundRotationRef={lookAroundRotationRef}
            onClick={handlePropertyClick}
            isSelectedOuter={selectedProperty === "wordOrder"}
            isSelectedInner={selectedProperty === "wordOrderFlexibility"}
          />
        </group>

        <MeshaTongue
          tongueMaterial={tongueMaterial}
          segments={segments}
          onClick={handlePropertyClick}
          isSelected={selectedProperty === "tonality"}
        />
        <MeshaTeeth
          toothCount={phonemeCount}
          clusterSize={maxClusterSize}
          onClick={handlePropertyClick}
          isSelected={selectedProperty === "phonemeCount"}
        />
        {caseCount && (
          <MeshaMoustache
            linguisticProperty="caseCount"
            tuftCount={caseCount}
            color={shiftHue(color, 120)}
            y={meshaSize * 0.7}
            z={0.5}
            onClick={handlePropertyClick}
            isSelected={selectedProperty === "caseCount"}
            audioBand="harmonicsData"
          />
        )}
        {nounClassCount && (
          <MeshaMoustache
            linguisticProperty="nounClassCount"
            tuftCount={nounClassCount}
            color={color}
            y={meshaSize * 1.4}
            z={0}
            onClick={handlePropertyClick}
            isSelected={selectedProperty === "nounClassCount"}
            audioBand="fundamentalData"
          />
        )}
      </group>
      <MeshaLight />
    </a.group>
  );
};

export default Mesha;
