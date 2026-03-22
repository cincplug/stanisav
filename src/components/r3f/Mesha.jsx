import {
  useRef,
  useMemo,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { Text } from "@react-three/drei";
// Simple 3D tooltip component using Drei's <Text>
const Tooltip3D = ({ position, label, value, onClose }) => {
  if (!position) return null;
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[1.5, 0.5]} />
        <meshStandardMaterial color="#222" transparent opacity={0.85} />
      </mesh>
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.18}
        anchorX="center"
        anchorY="middle"
        color="#fff"
        outlineWidth={0}
        maxWidth={1.4}
        fontWeight="normal"
      >
        {`${label}: ${value}`}
      </Text>
    </group>
  );
};
import { extend, useFrame } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";
import microphoneService from "../../services/microphoneService.js";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useTonalityMaterial } from "../../hooks/useTonalityMaterial.js";
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

// Context to signal if Mesha is hovered
export const MeshaHoverContext = createContext(false);

const Mesha = ({
  linguisticProperties,
  color,
  position,
  isMyMesha,
  tonalityType,
  looksAround,
  setMeshaHovered, // optional callback for parent
}) => {
  // Track if any subcomponent is hovered
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();
  const lookAroundRef = useRef();
  const eyesGroupRef = useRef();
  const lookAroundRotationRef = useRef(0);

  // Tooltip state: { label, value, position, key }
  const [tooltip, setTooltip] = useState(null);

  // Show tooltip handler
  const handleShowTooltip = ({ label, value, position, key }) => {
    setTooltip({ label, value, position, key });
  };

  // Hide tooltip handler
  const handleHideTooltip = () => setTooltip(null);

  const { controls } = useControls();
  const { meshaSize, eyeZ, eyeX, eyeY, noseSize, tension, friction } = controls;

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

  return (
    <MeshaHoverContext.Provider value={hovered}>
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
            onShowTooltip={() =>
              handleShowTooltip({
                label: "Morphology", // TODO: localize
                value: scores.morphology,
                position: [-earPosition.x, earPosition.y, earPosition.z],
                key: "morphology",
              })
            }
            selected={tooltip?.key === "morphology"}
            onPointerOver={() => {
              setHovered(true);
              setMeshaHovered?.(true);
            }}
            onPointerOut={() => {
              setHovered(false);
              setMeshaHovered?.(false);
            }}
          />

          <group ref={eyesGroupRef} position={[0, 1, mainZ]}>
            <MeshaEye
              position={[-eyeX, eyeY, 0]}
              color={color}
              sizeSignal={eyeSizeSignal}
              depthSignal={eyeDepthSignal}
              onShowTooltip={() =>
                handleShowTooltip({
                  label: "Evidentiality", // TODO: localize
                  value: scores.evidentiality,
                  position: [-eyeX, eyeY, mainZ],
                  key: "evidentiality",
                })
              }
              selected={tooltip?.key === "evidentiality"}
              onPointerOver={() => {
                setHovered(true);
                setMeshaHovered?.(true);
              }}
              onPointerOut={() => {
                setHovered(false);
                setMeshaHovered?.(false);
              }}
            />
            <MeshaEye
              position={[eyeX, eyeY, 0]}
              color={color}
              sizeSignal={eyeSizeSignal}
              depthSignal={eyeDepthSignal}
              onShowTooltip={() =>
                handleShowTooltip({
                  label: "Evidentiality", // TODO: localize
                  value: scores.evidentiality,
                  position: [eyeX, eyeY, mainZ],
                  key: "evidentiality",
                })
              }
              selected={tooltip?.key === "evidentiality"}
              onPointerOver={() => {
                setHovered(true);
                setMeshaHovered?.(true);
              }}
              onPointerOut={() => {
                setHovered(false);
                setMeshaHovered?.(false);
              }}
            />
            <MeshaNose
              position={[0, eyeY - eyeX / 2, 0]}
              scale={noseSize}
              segmentColors={noseSegmentColors}
              motionIntensity={noseMotionIntensity}
              lookAroundRotationRef={lookAroundRotationRef}
              onShowTooltip={() =>
                handleShowTooltip({
                  label: "Word Order Flexibility", // TODO: localize
                  value: scores.wordOrderFlexibility,
                  position: [0, eyeY - eyeX / 2, 0],
                  key: "wordOrderFlexibility",
                })
              }
              selected={tooltip?.key === "wordOrderFlexibility"}
              onPointerOver={() => {
                setHovered(true);
                setMeshaHovered?.(true);
              }}
              onPointerOut={() => {
                setHovered(false);
                setMeshaHovered?.(false);
              }}
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
              onShowTooltip={() =>
                handleShowTooltip({
                  label: "Case Count", // TODO: localize
                  value: caseCount,
                  position: [0, meshaSize * 0.7, 0.5],
                  key: "caseCount",
                })
              }
              selected={tooltip?.key === "caseCount"}
              onPointerOver={() => {
                setHovered(true);
                setMeshaHovered?.(true);
              }}
              onPointerOut={() => {
                setHovered(false);
                setMeshaHovered?.(false);
              }}
            />
          )}
          {nounClassCount && (
            <MeshaMoustache
              moustacheCount={nounClassCount}
              color={shiftHue(color, 120)}
              y={meshaSize * 1.4}
              z={0}
              onShowTooltip={() =>
                handleShowTooltip({
                  label: "Noun Class Count", // TODO: localize
                  value: nounClassCount,
                  position: [0, meshaSize * 1.4, 0],
                  key: "nounClassCount",
                })
              }
              selected={tooltip?.key === "nounClassCount"}
              onPointerOver={() => {
                setHovered(true);
                setMeshaHovered?.(true);
              }}
              onPointerOut={() => {
                setHovered(false);
                setMeshaHovered?.(false);
              }}
            />
          )}
        </group>
        <MeshaLight spread={1.5} />
        {/* Tooltip3D overlay */}
        {tooltip && (
          <Tooltip3D
            position={tooltip.position}
            label={tooltip.label}
            value={tooltip.value}
            onClose={handleHideTooltip}
          />
        )}
      </a.group>
    </MeshaHoverContext.Provider>
  );
};

export default Mesha;
