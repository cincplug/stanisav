import { useRef, useMemo, useEffect } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";
import microphoneService from "../../services/microphoneService.js";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext.jsx";
import { useTonalityMaterial } from "../../hooks/useTonalityMaterial.js";
import { useTooltips } from "../../hooks/useTooltips.js";
import { getFeatureScoreList } from "../../utils/linguisticUtils.js";
import { shiftHue } from "../../utils/colorUtils";
import MeshaEye from "./MeshaEye.jsx";
import MeshaEar from "./MeshaEar.jsx";
import MeshaTongue from "./MeshaTongue.jsx";
import MeshaNose from "./MeshaNose.jsx";
import MeshaTeeth from "./MeshaTeeth.jsx";
import MeshaMoustache from "./MeshaMoustache.jsx";
import MeshaLight from "./MeshaLight.jsx";
import Tooltip from "./Tooltip.jsx";

extend({ ParametricGeometry });
extend({ TextGeometry });

const Mesha = ({
  linguisticProperties,
  color,
  position,
  isMyMesha,
  tonalityType,
  looksAround,
}) => {
  const groupRef = useRef();
  const lookAroundRef = useRef();
  const eyesGroupRef = useRef();
  const lookAroundRotationRef = useRef(0);

  const { tooltip, showTooltip } = useTooltips();

  const { controls } = useControls();
  const { meshaSize, eyeZ, eyeX, eyeY, noseSize, tension, friction } = controls;
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
    config: { tension, friction },
  });

  const leftEarMaterial = useTonalityMaterial(
    shiftHue(color, -60),
    shiftHue(color, 60),
    tonalityType,
  );
  const rightEarMaterial = useTonalityMaterial(
    shiftHue(color, 60),
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

  const earPosition = useMemo(
    () => ({
      x: 1.37 - scores.morphology / 2,
      y: (scores.morphology + 1) / 4,
      z: 1,
    }),
    [scores.morphology],
  );

  // Map part to property value
  const partToProperty = {
    ear: "morphology",
    teeth: "phonemeCount",
    caseMoustache: "caseCount",
    nounClassMoustache: "nounClassCount",
    eyeOuter: "evidentiality",
    eyeInner: "verbAspect",
    pupil: "verbAspect",
    noseOuter: "wordOrder",
    noseInner: "wordOrderFlexibility",
  };

  // Handler for click: set selectedProperty if part is mapped
  const handleShowTooltip = (e) => {
    e.stopPropagation();
    const part = e?.object?.meshaPart;
    if (part && partToProperty[part]) {
      setSelectedProperty(partToProperty[part]);
    }
    showTooltip(e, {
      scores,
      earPosition,
      eyeX,
      eyeY,
      mainZ,
      meshaSize,
      caseCount,
      nounClassCount,
      phonemeCount,
      linguisticProperties,
    });
  };

  return (
    <a.group ref={groupRef} position={spring.position} scale={spring.scale}>
      <group ref={lookAroundRef}>
        <MeshaEar
          leftEarMaterial={leftEarMaterial}
          rightEarMaterial={rightEarMaterial}
          meshaSize={meshaSize}
          bend={scores.morphology / 3}
          leftSegments={10 - scores.morphology}
          rightSegments={2 + scores.morphology * 2}
          earPosition={earPosition}
          onShowTooltip={handleShowTooltip}
          isSelected={selectedProperty === "morphology"}
        />

        <group ref={eyesGroupRef} position={[0, 1, mainZ]}>
          <MeshaEye
            position={[-eyeX, eyeY, 0]}
            color={color}
            sizeSignal={eyeSizeSignal}
            depthSignal={eyeDepthSignal}
            onShowTooltip={handleShowTooltip}
            isSelectedOuter={selectedProperty === "evidentiality"}
            isSelectedInner={selectedProperty === "verbAspect"}
          />
          <MeshaEye
            position={[eyeX, eyeY, 0]}
            color={color}
            sizeSignal={eyeSizeSignal}
            depthSignal={eyeDepthSignal}
            onShowTooltip={handleShowTooltip}
            isSelectedOuter={selectedProperty === "evidentiality"}
            isSelectedInner={selectedProperty === "verbAspect"}
          />
          <MeshaNose
            position={[0, eyeY - eyeX / 2, 0]}
            scale={noseSize}
            segmentColors={noseSegmentColors}
            motionIntensity={noseMotionIntensity}
            lookAroundRotationRef={lookAroundRotationRef}
            onShowTooltip={handleShowTooltip}
            isSelectedOuter={selectedProperty === "wordOrder"}
            isSelectedInner={selectedProperty === "wordOrderFlexibility"}
          />
        </group>

        <MeshaTongue mouthMaterial={mouthMaterial} segments={segments} />
        <MeshaTeeth
          toothCount={phonemeCount}
          clusterSize={maxClusterSize}
          onShowTooltip={handleShowTooltip}
          isSelected={selectedProperty === "phonemeCount"}
        />
        {caseCount && (
          <MeshaMoustache
            meshaPart="caseMoustache"
            moustacheCount={caseCount}
            color={color}
            y={meshaSize * 0.7}
            z={0.5}
            onShowTooltip={handleShowTooltip}
            isSelected={selectedProperty === "caseCount"}
          />
        )}
        {nounClassCount && (
          <MeshaMoustache
            meshaPart="nounClassMoustache"
            moustacheCount={nounClassCount}
            color={shiftHue(color, 120)}
            y={meshaSize * 1.4}
            z={0}
            onShowTooltip={handleShowTooltip}
            isSelected={selectedProperty === "nounClassCount"}
          />
        )}
      </group>
      <MeshaLight spread={1.5} />

      {tooltip && (
        <Tooltip
          position={tooltip.position}
          label={tooltip.label}
          value={tooltip.value}
        />
      )}
    </a.group>
  );
};

export default Mesha;
