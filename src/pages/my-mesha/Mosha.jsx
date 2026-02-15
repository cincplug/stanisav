/**
 * Mosha - Custom Mesha page with microphone input
 * URL format: /mosha?language=ach
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useControls } from "../../contexts/ControlsContext.jsx";
import { useSpring, animated } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

// Import all Mesha sub-components
import MeshaCheek from "../../components/r3f/MeshaCheek.jsx";
import MeshaEye from "../../components/r3f/MeshaEye.jsx";
import MeshaMoustache from "../../components/r3f/MeshaMoustache.jsx";
import MeshaNose from "../../components/r3f/MeshaNose.jsx";
import MeshaTeeth from "../../components/r3f/MeshaTeeth.jsx";
import MeshaTongue from "../../components/r3f/MeshaTongue.jsx";
import NodeLight from "../../components/r3f/NodeLight.jsx";
import { createAudioReactiveSurface } from "../../utils/audioReactiveSurface.js";
import { calculateLanguageColors } from "../../utils/colorUtils.js";
import { shiftHue } from "../../utils/colorUtils.js";
import { getFeatureScoreList } from "../../utils/linguisticUtils.js";
import { useTonalityMaterial } from "../../hooks/useTonalityMaterial.js";
import { useAudioAnimation } from "../../hooks/useAudioAnimation.js";
import audioVisualizationConfig from "../../config/audioVisualizationConfig.json";
import { defaultAudioData } from "../../config/meshaDefaultAudioData.js";
import { extend } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";

import {
  MoshaProvider,
  useLanguageSelection,
  useAppState,
} from "./MoshaProvider.jsx";
import { loadLanguageData, isValidLanguageCode } from "./dataLoader.js";
import microphoneService from "../../services/microphoneService.js";
import "./Mosha.css";

extend({ ParametricGeometry });

// Simplified Mesha component for Mosha - positioned at origin
const SimpleMesha = ({ languageCode }) => {
  const groupRef = useRef();
  const rotationGroupRef = useRef();
  const eyesGroupRef = useRef();
  const meshaCheekRef = useRef();
  const meshaRotationRef = useRef(0);
  const lastAudioDataRef = useRef(defaultAudioData);

  const { controls } = useControls();
  const { groupColors } = useLanguageSelection();
  const { data } = useAppState();

  const { meshaSize, eyeZ, eyeX, eyeY, noseSize } = controls;

  // Fixed position at origin for visibility
  const position = [0, 0, 0];

  // Calculate color
  const color = useMemo(() => {
    if (!data?.languageData || !data?.languageGroups || !groupColors) {
      return "#ffffff";
    }
    const languageColors = calculateLanguageColors(
      data.languageData,
      data.languageGroups,
      groupColors,
      30,
    );
    return languageColors[languageCode];
  }, [data?.languageData, data?.languageGroups, groupColors, languageCode]);

  if (!data || !languageCode) return null;

  const linguisticProperties = data?.typologicalFeatures?.[languageCode];
  const scores = getFeatureScoreList(linguisticProperties, [
    "wordOrderFlexibility",
    "morphology",
    "evidentiality",
    "verbAspect",
  ]);

  const spring = useSpring({
    position,
    scale: [meshaSize, meshaSize, meshaSize],
    config: { mass: 1, tension: 120, friction: 20 },
  });

  const { audioData: rawAudioData } = useAudioAnimation();

  let audioData;
  if (rawAudioData.isActive) {
    audioData = rawAudioData;
    lastAudioDataRef.current = rawAudioData;
  } else {
    audioData = lastAudioDataRef.current;
  }

  const leftCheekMaterial = useTonalityMaterial(
    shiftHue(color, 30),
    languageCode,
  );
  const rightCheekMaterial = useTonalityMaterial(
    shiftHue(color, -30),
    languageCode,
  );
  const mouthMaterial = useTonalityMaterial(color, languageCode);

  useFrame(({ camera, clock }) => {
    if (groupRef.current) {
      const targetRotationY = 0;
      groupRef.current.rotation.y +=
        (targetRotationY - groupRef.current.rotation.y) * 0.05;
    }

    if (rotationGroupRef.current) {
      rotationGroupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      meshaRotationRef.current = rotationGroupRef.current.rotation.y;
    }
  });

  const segments = audioVisualizationConfig.meshDeformation.meshSegments;
  const mainZ = meshaSize * eyeZ;

  const evidentialitySize = 1 + scores.evidentiality / 4;
  const verbAspectSize = scores.verbAspect / 4;

  const audioReactiveSurface = useMemo(
    () =>
      createAudioReactiveSurface(audioData, {
        size: meshaSize,
        bend: scores.wordOrderFlexibility,
        radius: meshaSize * 2,
      }),
    [audioData, meshaSize, scores.wordOrderFlexibility],
  );

  return (
    <animated.group ref={groupRef} {...spring}>
      <group ref={rotationGroupRef}>
        <MeshaCheek
          ref={meshaCheekRef}
          leftCheekMaterial={leftCheekMaterial}
          rightCheekMaterial={rightCheekMaterial}
          audioReactiveSurface={audioReactiveSurface}
          leftSegments={segments}
          rightSegments={segments}
          scores={scores}
        />

        <MeshaTongue
          mouthMaterial={mouthMaterial}
          audioReactiveSurface={audioReactiveSurface}
          segments={segments}
        />

        {linguisticProperties?.phonemeCount > 0 && (
          <MeshaTeeth languageCode={languageCode} />
        )}

        <group ref={eyesGroupRef}>
          <MeshaEye
            position={[-eyeX, eyeY, mainZ]}
            color={color}
            evidentialitySize={evidentialitySize}
            verbAspectSize={verbAspectSize}
          />
          <MeshaEye
            position={[eyeX, eyeY, mainZ]}
            color={color}
            evidentialitySize={evidentialitySize}
            verbAspectSize={verbAspectSize}
          />
        </group>

        <MeshaNose
          position={[0, eyeY / 2, mainZ + noseSize]}
          color={color}
          scale={1}
          wordOrder={linguisticProperties?.wordOrder || "SVO"}
          wordOrderFlexibilityScore={scores.wordOrderFlexibility}
          meshaRotationRef={meshaRotationRef}
        />

        {linguisticProperties?.caseCount > 0 && (
          <MeshaMoustache languageCode={languageCode} />
        )}
      </group>

      <NodeLight spread={2} />
    </animated.group>
  );
};

const MoshaContent = ({ languageCode, data }) => {
  const { controls } = useControls();
  const { fov, near, far, backgroundColor } = controls;

  // Position camera closer to origin to see Mesha
  const cameraPosition = [0, 0, 45];

  return (
    <Canvas
      className="mosha-canvas"
      camera={{
        position: cameraPosition,
        fov,
        near,
        far,
      }}
      gl={{ antialias: true, clearColor: backgroundColor }}
    >
      <color attach="background" args={[backgroundColor]} />

      <OrbitControls
        enableDamping={true}
        makeDefault={true}
        enableZoom={true}
        target={[0, 0, 0]}
      />

      <SimpleMesha languageCode={languageCode} />
    </Canvas>
  );
};

const Mosha = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [micStatus, setMicStatus] = useState({
    isCapturing: false,
    error: null,
    isSupported: microphoneService.getStatus().isSupported,
  });

  // Get language code from URL parameter
  const languageCode = searchParams.get("language");

  // Load language data
  useEffect(() => {
    if (!languageCode) {
      return;
    }

    if (!isValidLanguageCode(languageCode)) {
      console.error(`Invalid language code: ${languageCode}`);
      return;
    }

    const languageData = loadLanguageData(languageCode);
    if (languageData) {
      setData(languageData);
    }
  }, [languageCode]);

  // Start microphone capture when component mounts
  const startMicrophone = useCallback(async () => {
    const result = await microphoneService.startCapture();
    setMicStatus({
      isCapturing: result.success,
      error: result.success ? null : result.error,
      isSupported: true,
    });
  }, []);

  // Stop microphone when component unmounts
  useEffect(() => {
    return () => {
      microphoneService.stopCapture();
    };
  }, []);

  // Handle microphone toggle
  const toggleMicrophone = useCallback(async () => {
    if (micStatus.isCapturing) {
      microphoneService.stopCapture();
      setMicStatus((prev) => ({ ...prev, isCapturing: false, error: null }));
    } else {
      await startMicrophone();
    }
  }, [micStatus.isCapturing, startMicrophone]);

  // Render error states
  if (!languageCode) {
    return (
      <div className="mosha-container">
        <div className="mosha-error">
          <h1>Language Required</h1>
          <p>Please specify a language code in the URL:</p>
          <code>/mosha?language=ach</code>
          <br />
          <br />
          <Link to="/">← Back to main page</Link>
        </div>
      </div>
    );
  }

  if (!isValidLanguageCode(languageCode)) {
    return (
      <div className="mosha-container">
        <div className="mosha-error">
          <h1>Invalid Language Code</h1>
          <p>
            Language code &quot;{languageCode}&quot; not found in the database.
          </p>
          <Link to="/">← Back to main page</Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mosha-container">
        <div className="mosha-loading">Loading language data...</div>
      </div>
    );
  }

  if (!micStatus.isSupported) {
    return (
      <div className="mosha-container">
        <div className="mosha-error">
          <h1>Microphone Not Supported</h1>
          <p>
            Your browser doesn&apos;t support microphone access. Please use a
            modern browser.
          </p>
          <Link to="/">← Back to main page</Link>
        </div>
      </div>
    );
  }

  const languageName = data.languageData[languageCode]?.name || languageCode;

  return (
    <div className="mosha-container">
      <MoshaProvider languageCode={languageCode} data={data}>
        <MoshaContent languageCode={languageCode} data={data} />

        {/* Controls overlay */}
        <div className="mosha-controls">
          <div className="mosha-header">
            <h1>{languageName} Mesha</h1>
            <Link to="/" className="back-link">
              ← Main page
            </Link>
          </div>

          <div className="microphone-controls">
            {!micStatus.isCapturing && !micStatus.error && (
              <button onClick={startMicrophone} className="mic-button primary">
                🎤 Start Microphone
              </button>
            )}

            {micStatus.isCapturing && (
              <button onClick={toggleMicrophone} className="mic-button active">
                🔴 Recording...
              </button>
            )}

            {micStatus.error && (
              <div className="mic-error">
                <p>Microphone Error: {micStatus.error}</p>
                <button onClick={startMicrophone} className="mic-button">
                  Try Again
                </button>
              </div>
            )}

            {!micStatus.isCapturing && !micStatus.error && (
              <p className="mic-hint">
                Click to allow microphone access and see your voice visualized
              </p>
            )}
          </div>
        </div>
      </MoshaProvider>
    </div>
  );
};

export default Mosha;
