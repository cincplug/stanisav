const AUDIO_VOLUME = 0.5;
const READY_TIMEOUT_DURATION = 3500;
const READY_THRESHOLD = 2; // HAVE_CURRENT_DATA

// Loads and plays a single audio URL on the given element, resolving when
// playback of that track has ended (or rejecting on load/playback failure).
export async function playAudioTrack(audio, audioUrl, config) {
  const { default: audioAnalysisService } =
    await import("./audioAnalysisService.js");

  return new Promise((resolveTrack, rejectTrack) => {
    let isTrackSettled = false;

    const settleTrack = (fn) => {
      if (isTrackSettled) return;
      isTrackSettled = true;
      audio.removeEventListener("ended", handleTrackEnded);
      fn();
    };

    const handleTrackEnded = () => settleTrack(resolveTrack);

    audio.pause();
    audio.removeEventListener("ended", handleTrackEnded);
    audio.preload = "auto";
    audio.src = audioUrl;
    audio.volume = AUDIO_VOLUME;
    // Calling load() after setting src initiates buffering
    audio.load();

    waitUntilReady(audio, audioUrl)
      .then(() => audioAnalysisService.setupVisualization(audio, config))
      .then(() => {
        audio.addEventListener("ended", handleTrackEnded);
        return audio.play();
      })
      .catch((error) => settleTrack(() => rejectTrack(error)));
  });
}

// Plays each url in audioUrls sequentially on the given audio element, waiting
// delayDuration between tracks. shouldContinue is checked before each track so
// callers can abort the sequence (e.g. on effect cleanup) without throwing.
export async function playAudioSequence({
  audio,
  audioUrls,
  config,
  delayDuration,
  shouldContinue,
}) {
  for (let urlIndex = 0; urlIndex < audioUrls.length; urlIndex += 1) {
    if (!shouldContinue()) return;

    const audioUrl = audioUrls[urlIndex];
    await playAudioTrack(audio, audioUrl, config);

    // Delay between original and luka samples when both are queued; skip
    // this wait after the last track in the sequence
    const isLastTrack = urlIndex === audioUrls.length - 1;
    if (!isLastTrack) {
      await new Promise((resolveDelay) => {
        setTimeout(resolveDelay, delayDuration);
      });
    }
  }
}

// Resolves once the audio element has buffered enough data to start playback
// without clipping, or rejects on error / readiness timeout (slow network fallback).
function waitUntilReady(audio, audioUrl) {
  return new Promise((resolveReady, rejectReady) => {
    let isReadySettled = false;

    const cleanupReadyListeners = () => {
      audio.removeEventListener("canplaythrough", handleReady);
      audio.removeEventListener("canplay", handleReady);
      audio.removeEventListener("loadeddata", handleReady);
      audio.removeEventListener("error", handleError);
    };

    const settleReady = (fn) => {
      if (isReadySettled) return;
      isReadySettled = true;
      clearTimeout(readyTimeoutId);
      cleanupReadyListeners();
      fn();
    };

    const handleReady = () => {
      if (audio.readyState >= READY_THRESHOLD) settleReady(resolveReady);
    };

    const handleError = () => {
      settleReady(() =>
        rejectReady(new Error(`Failed to load audio: ${audioUrl}`)),
      );
    };

    // Don't block forever on slow networks; proceed if minimum data is available
    const readyTimeoutId = setTimeout(() => {
      if (audio.readyState >= READY_THRESHOLD) {
        settleReady(resolveReady);
      } else {
        settleReady(() =>
          rejectReady(new Error(`Audio readiness timeout for: ${audioUrl}`)),
        );
      }
    }, READY_TIMEOUT_DURATION);

    // Resolve immediately if already buffered enough (e.g. cached)
    if (audio.readyState >= READY_THRESHOLD) {
      settleReady(resolveReady);
      return;
    }

    audio.addEventListener("canplaythrough", handleReady);
    audio.addEventListener("canplay", handleReady);
    audio.addEventListener("loadeddata", handleReady);
    audio.addEventListener("error", handleError);
  });
}
