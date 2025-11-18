import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getAudioAnalysisService } from "../services/audioService.js";
import audioVisualizationConfig from "../config/audioVisualizationConfig.json";
import visualConstants from "../config/visualConstants.json";

export function useViewportTransparency(
  meshRef,
  materialRef,
  baseOpacity = 1.0
) {
  const viewportThreshold = 0.8;
  const transparencyMultiplier = 0.3;
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    const mesh = meshRef.current;
    const camera = state.camera;
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
    const distance = camera.position.distanceTo(mesh.position);
    const screenSize = (size.length() / distance) * 100;
    if (screenSize > viewportThreshold) {
      materialRef.current.opacity = baseOpacity * transparencyMultiplier;
      materialRef.current.transparent = true;
    } else {
      materialRef.current.opacity = baseOpacity;
      materialRef.current.transparent = baseOpacity < 1.0;
    }
  });
}

export function useAudioAnimation(languageCode, isThisLanguageSelected) {
  const [audioData, setAudioData] = useState({
    fundamentalData: new Array(
      audioVisualizationConfig.meshDeformation.frequencyBands
    ).fill(0),
    harmonicsData: new Array(
      audioVisualizationConfig.meshDeformation.frequencyBands
    ).fill(0),
    isActive: false
  });

  const rotationStateRef = useRef({
    currentYRotation: 0,
    targetYRotation: 0,
    audioStartTime: 0,
    wasAudioActive: false
  });

  useEffect(() => {
    if (!isThisLanguageSelected) {
      setAudioData({
        fundamentalData: new Array(
          audioVisualizationConfig.meshDeformation.frequencyBands
        ).fill(0),
        harmonicsData: new Array(
          audioVisualizationConfig.meshDeformation.frequencyBands
        ).fill(0),
        isActive: false
      });
      return;
    }
    const audioService = getAudioAnalysisService();
    const handleAudioData = (data) => {
      setAudioData(data);
    };
    audioService.addCallback(handleAudioData);
    return () => {
      audioService.removeCallback(handleAudioData);
    };
  }, [isThisLanguageSelected]);

  return { audioData, rotationStateRef };
}

export function useRotationAnimation(
  meshRef,
  baseRotation,
  audioData,
  rotationStateRef
) {
  const { cameraFacingTiltDegrees } = visualConstants.languageNode;

  const {
    audioRotationSpeed,
    audioRotationAmplitude,
    rotationLerpSpeed,
    rotationDecaySpeed,
    rotationDecayRate
  } = audioVisualizationConfig.meshDeformation;

  useFrame((state) => {
    if (!meshRef.current) return;
    const rotationState = rotationStateRef.current;
    const isAudioActive = audioData.isActive;
    if (isAudioActive && !rotationState.wasAudioActive) {
      rotationState.audioStartTime = state.clock.elapsedTime;
      rotationState.wasAudioActive = true;
    } else if (!isAudioActive && rotationState.wasAudioActive) {
      rotationState.wasAudioActive = false;
    }
    meshRef.current.lookAt(state.camera.position);
    if (cameraFacingTiltDegrees !== 0) {
      meshRef.current.rotateX(cameraFacingTiltDegrees);
    }
    meshRef.current.rotateX(baseRotation[0]);
    meshRef.current.rotateY(baseRotation[1]);
    meshRef.current.rotateZ(baseRotation[2]);
    let targetYRotation = baseRotation[1];
    if (isAudioActive) {
      const audioTime = state.clock.elapsedTime - rotationState.audioStartTime;
      const oscillation =
        Math.sin(audioTime * audioRotationSpeed) * audioRotationAmplitude;
      targetYRotation = baseRotation[1] + oscillation;
    } else {
      targetYRotation =
        rotationState.currentYRotation +
        (baseRotation[1] - rotationState.currentYRotation) * rotationDecayRate;
    }
    const lerpSpeed = isAudioActive ? rotationLerpSpeed : rotationDecaySpeed;
    rotationState.currentYRotation +=
      (targetYRotation - rotationState.currentYRotation) * lerpSpeed;
    meshRef.current.rotation.y = rotationState.currentYRotation;
  });
}
