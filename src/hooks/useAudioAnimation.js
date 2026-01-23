import { useRef, useState, useEffect } from "react";
import { getAudioAnalysisService } from "../services/audioService.js";
import { defaultAudioData } from "../config/meshaDefaultAudioData.js";

export function useAudioAnimation() {
  const [audioData, setAudioData] = useState(defaultAudioData);

  const rotationStateRef = useRef({
    currentYRotation: 0,
    targetYRotation: 0,
    audioStartTime: 0,
    wasAudioActive: false,
  });

  useEffect(() => {
    const audioService = getAudioAnalysisService();
    const handleAudioData = (data) => {
      setAudioData(data);
    };
    audioService.addCallback(handleAudioData);
    return () => {
      audioService.removeCallback(handleAudioData);
    };
  }, []);

  return { audioData, rotationStateRef };
}
