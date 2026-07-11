import defaultAudioData from "../config/defaultAudioData.json";

class AudioAnalysisService {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.frequencyData = null;
    this.isAnalyzing = false;
    this.callbacks = new Set();
    this.deltaAccumulator = 0;
    this.animationFrameId = null;
    this.connectedAudioElements = new Set();

    this.fundamentalData = defaultAudioData.fundamentalData;
    this.harmonicsData = defaultAudioData.harmonicsData;

    this.analysisConfig = null;
  }

  async initializeAudioContext() {
    if (this.audioContext && this.audioContext.state !== "closed") {
      return;
    }

    try {
      this.audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      this.analyser = this.audioContext.createAnalyser();

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.frequencyData = new Float32Array(bufferLength);
    } catch (error) {
      console.error("Failed to initialize audio context:", error);
      throw error;
    }
  }

  connectAudioElement(audioElement) {
    if (!this.audioContext || !this.analyser) {
      throw new Error("Audio context not initialized");
    }

    try {
      const source = this.audioContext.createMediaElementSource(audioElement);
      source.connect(this.analyser);
      source.connect(this.audioContext.destination);
      return source;
    } catch (error) {
      console.error("Failed to connect audio element:", error);
      throw error;
    }
  }

  // Wires an audio element to this service: initializes the audio context,
  // connects the element to the analyser, and starts/stops analysis alongside
  // the element's own play/pause/ended/error events. Safe to call multiple
  // times on the same element; subsequent calls are no-ops.
  // config must include mesha and voiceRange groups
  async setupVisualization(audioElement, config) {
    if (!audioElement || this.connectedAudioElements.has(audioElement)) {
      return;
    }

    try {
      await this.initializeAudioContext();
      this.connectAudioElement(audioElement);
      this.connectedAudioElements.add(audioElement);

      audioElement.addEventListener("play", () => {
        this.startAnalysis(config);
      });

      audioElement.addEventListener("pause", () => {
        this.stopAnalysis();
      });

      audioElement.addEventListener("ended", () => {
        this.stopAnalysis();
      });

      const cleanup = () => {
        this.connectedAudioElements.delete(audioElement);
        this.stopAnalysis();
      };

      audioElement.addEventListener("error", cleanup);
    } catch (error) {
      console.error("Failed to setup audio visualization:", error);
    }
  }

  // config must include { mesha: { timeRate, amplitudeThreshold, decayRate }, voiceRange: { ... } }
  startAnalysis(config) {
    if (this.isAnalyzing) {
      return;
    }

    this.analysisConfig = config;
    this.isAnalyzing = true;
    this.analyzeAudio();
  }

  stopAnalysis() {
    this.isAnalyzing = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // this.notifyCallbacks({
    //   fundamentalData: this.fundamentalData,
    //   harmonicsData: this.harmonicsData,
    // });
  }

  analyzeAudio() {
    if (!this.isAnalyzing) return;

    const now = performance.now();
    const delta = now - (this.lastFrameTime ?? now);
    this.lastFrameTime = now;
    this.deltaAccumulator += delta;

    const { timeRate } = this.analysisConfig;
    if (this.deltaAccumulator >= timeRate) {
      this.deltaAccumulator -= timeRate;
      this.analyser.getByteFrequencyData(this.dataArray);
      this.processFrequencyData();
      this.notifyCallbacks({
        fundamentalData: this.fundamentalData,
        harmonicsData: this.harmonicsData,
      });
    }

    this.animationFrameId = requestAnimationFrame(() => this.analyzeAudio());
  }

  processFrequencyData() {
    const sampleRate = this.audioContext.sampleRate;
    const nyquist = sampleRate / 2;
    const binCount = this.dataArray.length;

    const { fundamentalMin, fundamentalMax, harmonicsMin, harmonicsMax } =
      this.analysisConfig;

    const fundamentalMinBin = Math.floor((fundamentalMin / nyquist) * binCount);
    const fundamentalMaxBin = Math.floor((fundamentalMax / nyquist) * binCount);
    const harmonicsMinBin = Math.floor((harmonicsMin / nyquist) * binCount);
    const harmonicsMaxBin = Math.floor((harmonicsMax / nyquist) * binCount);

    this.processFrequencyBand(
      fundamentalMinBin,
      fundamentalMaxBin,
      this.fundamentalData,
    );
    this.processFrequencyBand(
      harmonicsMinBin,
      harmonicsMaxBin,
      this.harmonicsData,
    );
  }

  processFrequencyBand(startBin, endBin, outputArray) {
    const bandSize = Math.ceil((endBin - startBin) / outputArray.length);
    const { amplitudeThreshold, decayRate } = this.analysisConfig;

    for (let i = 0; i < outputArray.length; i++) {
      const binStart = startBin + i * bandSize;
      const binEnd = Math.min(binStart + bandSize, endBin);

      let sum = 0;
      let count = 0;

      for (let bin = binStart; bin < binEnd; bin++) {
        if (bin < this.dataArray.length) {
          sum += this.dataArray[bin];
          count++;
        }
      }

      const average = count > 0 ? sum / count : 0;
      const normalized = average / 255;
      const newValue = normalized > amplitudeThreshold ? normalized : 0;
      outputArray[i] = outputArray[i] * decayRate + newValue * (1 - decayRate);
    }
  }

  addCallback(callback) {
    this.callbacks.add(callback);
  }

  removeCallback(callback) {
    this.callbacks.delete(callback);
  }

  notifyCallbacks(data) {
    this.callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("Error in audio analysis callback:", error);
      }
    });
  }

  cleanup() {
    this.stopAnalysis();

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
    }

    this.callbacks.clear();
    this.connectedAudioElements.clear();
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.frequencyData = null;
    this.analysisConfig = null;
  }
}

const audioAnalysisService = new AudioAnalysisService();

export default audioAnalysisService;
