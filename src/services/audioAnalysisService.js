import defaultAudioData from "../config/defaultAudioData.json";
import { config } from "../modules/configStore";

/**
 * Audio Analysis Service
 * Provides real-time frequency analysis for audio visualization
 */
class AudioAnalysisService {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.frequencyData = null;
    this.isAnalyzing = false;
    this.callbacks = new Set();
    this.deltaAccumulator = 0;

    // Configuration
    this.config = config;

    // Frequency analysis data - separate for better voice representation
    this.fundamentalData = defaultAudioData.fundamentalData;
    this.harmonicsData = defaultAudioData.harmonicsData;

    // Animation frame ID for cleanup
    this.animationFrameId = null;
  }

  /**
   * Initialize audio context and analyser
   */
  async initializeAudioContext() {
    if (this.audioContext && this.audioContext.state !== "closed") {
      return;
    }

    try {
      this.audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();

      // Create analyser node with destructured config
      this.analyser = this.audioContext.createAnalyser();

      // Create data arrays
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.frequencyData = new Float32Array(bufferLength);
    } catch (error) {
      console.error("Failed to initialize audio context:", error);
      throw error;
    }
  }

  /**
   * Connect an audio element to the analyser
   */
  connectAudioElement(audioElement) {
    if (!this.audioContext || !this.analyser) {
      throw new Error("Audio context not initialized");
    }

    try {
      // Create media element source
      const source = this.audioContext.createMediaElementSource(audioElement);

      // Connect: source -> analyser -> destination
      source.connect(this.analyser);
      source.connect(this.audioContext.destination);

      return source;
    } catch (error) {
      console.error("Failed to connect audio element:", error);
      throw error;
    }
  }

  /**
   * Start analyzing audio data
   */
  startAnalysis() {
    if (this.isAnalyzing) {
      return;
    }

    this.isAnalyzing = true;
    this.analyzeAudio();
  }

  /**
   * Stop analyzing audio data
   */
  stopAnalysis() {
    this.isAnalyzing = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Notify callbacks with empty data
    this.notifyCallbacks({
      fundamentalData: this.fundamentalData,
      harmonicsData: this.harmonicsData,
    });
  }

  /**
   * Main analysis loop
   */
  analyzeAudio() {
    if (!this.isAnalyzing) return;

    const now = performance.now();
    const delta = now - (this.lastFrameTime ?? now);
    this.lastFrameTime = now;
    this.deltaAccumulator += delta;

    const interval = this.config.meshDeformation.timeRate;
    if (this.deltaAccumulator >= interval) {
      this.deltaAccumulator -= interval;
      this.analyser.getByteFrequencyData(this.dataArray);
      this.processFrequencyData();
      this.notifyCallbacks({
        fundamentalData: this.fundamentalData,
        harmonicsData: this.harmonicsData,
      });
    }

    this.animationFrameId = requestAnimationFrame(() => this.analyzeAudio());
  }

  /**
   * Process raw frequency data into fundamental and harmonics bands for better voice representation
   */
  processFrequencyData() {
    const sampleRate = this.audioContext.sampleRate;
    const nyquist = sampleRate / 2;
    const binCount = this.dataArray.length;

    // Destructure human voice range config
    const { fundamentalMin, fundamentalMax, harmonicsMin, harmonicsMax } =
      this.config.voiceRange;

    // Convert frequencies to bin indices
    const fundamentalMinBin = Math.floor((fundamentalMin / nyquist) * binCount);
    const fundamentalMaxBin = Math.floor((fundamentalMax / nyquist) * binCount);
    const harmonicsMinBin = Math.floor((harmonicsMin / nyquist) * binCount);
    const harmonicsMaxBin = Math.floor((harmonicsMax / nyquist) * binCount);

    // Process fundamental frequencies (85-255Hz) - pitch, tone, emotional content
    this.processFrequencyBand(
      fundamentalMinBin,
      fundamentalMaxBin,
      this.fundamentalData,
    );

    // Process harmonics & formants (255-4000Hz) - speech intelligibility, phonetic content
    this.processFrequencyBand(
      harmonicsMinBin,
      harmonicsMaxBin,
      this.harmonicsData,
    );
  }

  /**
   * Process a specific frequency band
   */
  processFrequencyBand(startBin, endBin, outputArray) {
    const bandSize = Math.ceil((endBin - startBin) / outputArray.length);
    const { amplitudeThreshold, decayRate } = this.config.meshDeformation;

    for (let i = 0; i < outputArray.length; i++) {
      const binStart = startBin + i * bandSize;
      const binEnd = Math.min(binStart + bandSize, endBin);

      // Average amplitude across bins in this band
      let sum = 0;
      let count = 0;

      for (let bin = binStart; bin < binEnd; bin++) {
        if (bin < this.dataArray.length) {
          sum += this.dataArray[bin];
          count++;
        }
      }

      const average = count > 0 ? sum / count : 0;
      const normalized = average / 255; // Normalize to 0-1

      // Apply threshold and smoothing
      const newValue = normalized > amplitudeThreshold ? normalized : 0;

      // Smooth the transition
      outputArray[i] = outputArray[i] * decayRate + newValue * (1 - decayRate);
    }
  }

  /**
   * Add a callback for frequency data updates
   */
  addCallback(callback) {
    this.callbacks.add(callback);
  }

  /**
   * Remove a callback
   */
  removeCallback(callback) {
    this.callbacks.delete(callback);
  }

  /**
   * Notify all callbacks with current data
   */
  notifyCallbacks(data) {
    this.callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("Error in audio analysis callback:", error);
      }
    });
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.stopAnalysis();

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
    }

    this.callbacks.clear();
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.frequencyData = null;
  }
}

// Create singleton instance
const audioAnalysisService = new AudioAnalysisService();

export default audioAnalysisService;
