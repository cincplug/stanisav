const AUDIO_VOLUME = 0.5;
const READY_TIMEOUT_DURATION = 3500;
const READY_THRESHOLD = 2; // HAVE_CURRENT_DATA

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

// Plays each url in audioUrls sequentially. onPhaseChange(index, url) is called
// before each track so callers can track which sample is currently playing.
export async function playAudioSequence({
  audio,
  audioUrls,
  config,
  delayDuration,
  shouldContinue,
  onPhaseChange,
}) {
  for (let urlIndex = 0; urlIndex < audioUrls.length; urlIndex += 1) {
    if (!shouldContinue()) return;

    const audioUrl = audioUrls[urlIndex];
    onPhaseChange?.(urlIndex, audioUrl);
    await playAudioTrack(audio, audioUrl, config);

    const isLastTrack = urlIndex === audioUrls.length - 1;
    if (!isLastTrack) {
      await new Promise((resolveDelay) => {
        setTimeout(resolveDelay, delayDuration);
      });
    }
  }
}

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

    const readyTimeoutId = setTimeout(() => {
      if (audio.readyState >= READY_THRESHOLD) {
        settleReady(resolveReady);
      } else {
        settleReady(() =>
          rejectReady(new Error(`Audio readiness timeout for: ${audioUrl}`)),
        );
      }
    }, READY_TIMEOUT_DURATION);

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
