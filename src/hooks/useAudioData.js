import { useState, useEffect } from "react";
import audioAnalysisService from "../services/audioAnalysisService.js";
import defaultAudioData from "../config/defaultAudioData.json";

export function useAudioData() {
  const [audioData, setAudioData] = useState(defaultAudioData);

  useEffect(() => {
    const handleAudioData = (data) => {
      setAudioData(data);
    };
    audioAnalysisService.addCallback(handleAudioData);
    return () => {
      audioAnalysisService.removeCallback(handleAudioData);
    };
  }, []);

  return { audioData };
}
