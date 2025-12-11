import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getAudioAnalysisService } from "../services/audioService.js";
import audioVisualizationConfig from "../config/audioVisualizationConfig.json";

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
