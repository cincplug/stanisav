import { useState, useEffect } from "react";
import { getAudioAnalysisService } from "../services/audioService.js";
import defaultAudioData from "../config/defaultAudioData.json";

export function useAudioData() {
  const [audioData, setAudioData] = useState(defaultAudioData);

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

  return { audioData };
}
