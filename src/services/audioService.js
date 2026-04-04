/**
 * Simple local audio service for language samples
 */

import audioAnalysisService from "./audioAnalysisService.js";

// Simple cache for audio URLs
const audioUrlCache = new Map();

// Track selected audio elements for analysis
const selectedAudioElements = new Set();

/**
 * Get audio URL for a language using local files
 * Expected file format: /audio/samples/{languageCode}.mp3 or /audio/samples/{languageCode}-luka.mp3
 */
export async function getLanguageAudioUrl(languageCode, isLuka = true) {
  const cacheKey = `${languageCode}-${isLuka ? "luka" : "regular"}`;

  // Check cache first
  if (audioUrlCache.has(cacheKey)) {
    return audioUrlCache.get(cacheKey);
  }

  // Choose file path based on isLuka setting
  const suffix = isLuka ? "-luka" : "";
  const audioUrl = `/audio/samples/${languageCode}${suffix}.mp3`;

  // Test if file exists by trying to fetch it
  try {
    const response = await fetch(audioUrl, { method: "HEAD" });
    if (response.ok) {
      audioUrlCache.set(cacheKey, audioUrl);
      return audioUrl;
    } else {
      audioUrlCache.set(cacheKey, null);
      return null;
    }
  } catch (error) {
    audioUrlCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Setup audio element for visualization analysis
 */
export async function setupAudioVisualization(audioElement) {
  if (!audioElement || selectedAudioElements.has(audioElement)) {
    return;
  }

  try {
    // Initialize audio context if needed
    await audioAnalysisService.initializeAudioContext();

    // Connect audio element to analyser
    audioAnalysisService.connectAudioElement(audioElement);

    // Track this element
    selectedAudioElements.add(audioElement);

    // Setup event listeners
    audioElement.addEventListener("play", () => {
      audioAnalysisService.startAnalysis();
    });

    audioElement.addEventListener("pause", () => {
      audioAnalysisService.stopAnalysis();
    });

    audioElement.addEventListener("ended", () => {
      audioAnalysisService.stopAnalysis();
    });

    // Cleanup when element is removed
    const cleanup = () => {
      selectedAudioElements.delete(audioElement);
      audioAnalysisService.stopAnalysis();
    };

    audioElement.addEventListener("error", cleanup);
  } catch (error) {
    console.error("Failed to setup audio visualization:", error);
  }
}

/**
 * Get the audio analysis service instance
 */
export function getAudioAnalysisService() {
  return audioAnalysisService;
}
