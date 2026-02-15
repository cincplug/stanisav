/**
 * Microphone Service
 * Captures microphone input and connects it to the audio analysis service
 */

import audioAnalysisService from "./audioAnalysisService.js";

class MicrophoneService {
  constructor() {
    this.mediaStream = null;
    this.audioContext = null;
    this.sourceNode = null;
    this.isCapturing = false;
  }

  /**
   * Request microphone access and start capturing
   */
  async startCapture() {
    if (this.isCapturing) {
      console.log("Microphone already capturing");
      return { success: true };
    }

    try {
      // Request microphone permission
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Initialize audio context if needed
      await audioAnalysisService.initializeAudioContext();
      this.audioContext = audioAnalysisService.audioContext;

      // Create source from microphone stream
      this.sourceNode = this.audioContext.createMediaStreamSource(
        this.mediaStream,
      );

      // Connect to analyser
      if (audioAnalysisService.analyser) {
        this.sourceNode.connect(audioAnalysisService.analyser);
      }

      // Start analysis
      audioAnalysisService.startAnalysis();
      this.isCapturing = true;

      console.log("Microphone capture started");
      return { success: true };
    } catch (error) {
      console.error("Failed to start microphone capture:", error);
      return {
        success: false,
        error: error.message,
        errorType: error.name,
      };
    }
  }

  /**
   * Stop capturing microphone input
   */
  stopCapture() {
    if (!this.isCapturing) {
      return;
    }

    try {
      // Stop analysis
      audioAnalysisService.stopAnalysis();

      // Disconnect source
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }

      // Stop all tracks in the media stream
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
        this.mediaStream = null;
      }

      this.isCapturing = false;
      console.log("Microphone capture stopped");
    } catch (error) {
      console.error("Error stopping microphone capture:", error);
    }
  }

  /**
   * Check if browser supports microphone access
   */
  static isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Get current capture status
   */
  getStatus() {
    return {
      isCapturing: this.isCapturing,
      isSupported: MicrophoneService.isSupported(),
    };
  }
}

// Create singleton instance
const microphoneService = new MicrophoneService();

export default microphoneService;
