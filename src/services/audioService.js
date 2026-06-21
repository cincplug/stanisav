import audioAnalysisService from "./audioAnalysisService.js";

const audioUrlCache = new Map();
const selectedAudioElements = new Set();

export async function getLanguageAudioUrl(languageCode, isLuka = true) {
  const cacheKey = `${languageCode}-${isLuka ? "luka" : "regular"}`;

  if (audioUrlCache.has(cacheKey)) {
    return audioUrlCache.get(cacheKey);
  }

  const suffix = isLuka ? "-luka" : "";
  const audioUrl = `/audio/samples/${languageCode}${suffix}.mp3`;

  try {
    const response = await fetch(audioUrl, { method: "HEAD" });
    if (response.ok) {
      audioUrlCache.set(cacheKey, audioUrl);
      return audioUrl;
    } else {
      audioUrlCache.set(cacheKey, null);
      return null;
    }
  } catch {
    audioUrlCache.set(cacheKey, null);
    return null;
  }
}

// config must include meshaVisualization and voiceRange groups
export async function setupAudioVisualization(audioElement, config) {
  if (!audioElement || selectedAudioElements.has(audioElement)) {
    return;
  }

  try {
    await audioAnalysisService.initializeAudioContext();
    audioAnalysisService.connectAudioElement(audioElement);
    selectedAudioElements.add(audioElement);

    audioElement.addEventListener("play", () => {
      audioAnalysisService.startAnalysis(config);
    });

    audioElement.addEventListener("pause", () => {
      audioAnalysisService.stopAnalysis();
    });

    audioElement.addEventListener("ended", () => {
      audioAnalysisService.stopAnalysis();
    });

    const cleanup = () => {
      selectedAudioElements.delete(audioElement);
      audioAnalysisService.stopAnalysis();
    };

    audioElement.addEventListener("error", cleanup);
  } catch (error) {
    console.error("Failed to setup audio visualization:", error);
  }
}

export function getAudioAnalysisService() {
  return audioAnalysisService;
}
