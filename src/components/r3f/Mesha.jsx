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
import MeshaEyes from "./MeshaEyes.jsx";
import MeshaEar from "./MeshaEars.jsx";
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
  const lookAroundRotationRef = useRef(0);

  const { controls } = useControls();
  const { meshaSize, eyeZ, noseSize, eyeX, eyeY, tension, friction } = controls;
  const { selectedProperty, setSelectedProperty, selectedLanguage } =
    useLanguageSelection();

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

  const spring = useSpring({
    x: position[0],
    y: position[1],
    z: position[2],
    scale: meshaSize,
    config: { tension, friction },
  });

  const skinColor = shiftHue(color, -60);
  const skinColorInvert = shiftHue(color, 60);

  const skinMaterial = useShaderMaterial(skinColor, skinColorInvert, 0);
  const tongueMaterial = useShaderMaterial(
    skinColorInvert,
    skinColor,
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
          earMaterial={skinMaterial}
          size={meshaSize}
          bend={scores.morphology / 3}
          leftSegments={10 - scores.morphology}
          rightSegments={2 + scores.morphology * 2}
          earPosition={earPosition}
          onClick={handlePropertyClick}
          isSelected={selectedProperty === "morphology"}
        />

        <MeshaEyes
          irisColor={color}
          eyelidMaterial={skinMaterial}
          sizeSignal={scores.evidentiality}
          depthSignal={scores.verbAspect}
          isoCode={selectedLanguage}
          mainZ={mainZ}
          onClick={handlePropertyClick}
          isSelectedOuter={selectedProperty === "evidentiality"}
          isSelectedInner={selectedProperty === "verbAspect"}
        />

        <MeshaNose
          position={[0, 1 + eyeY - eyeX / 2, mainZ]}
          scale={noseSize}
          segmentColors={noseSegmentColors}
          motionIntensity={scores.wordOrderFlexibility}
          lookAroundRotationRef={lookAroundRotationRef}
          onClick={handlePropertyClick}
          isSelectedOuter={selectedProperty === "wordOrder"}
          isSelectedInner={selectedProperty === "wordOrderFlexibility"}
        />

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
            stepDeg={3}
          />
        )}
        {nounClassCount && (
          <MeshaMoustache
            linguisticProperty="nounClassCount"
            tuftCount={nounClassCount}
            color={color}
            y={meshaSize * 1.4}
            z={-1}
            onClick={handlePropertyClick}
            isSelected={selectedProperty === "nounClassCount"}
            audioBand="fundamentalData"
            stepDeg={12}
          />
        )}
      </group>
      <MeshaLight />
    </a.group>
  );
};

export default Mesha;
