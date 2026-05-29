import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getSortingData, sortLanguages } from "../utils/sortingUtils";
import { useAppState } from "./AppStateContext";
import { useControls } from "./ControlsContext";
import { useLanguageSelection } from "./LanguageSelectionContext";

const PlaylistContext = createContext(null);

export const PlaylistProvider = ({ children }) => {
  const { data, isSceneReady } = useAppState();
  const { controls } = useControls();
  const {
    isAutoplay,
    isMyMesha,
    isLuka,
    switchDuration,
    sortBy,
    labelContent,
    isReverse,
  } = controls;
  const { selectLanguage, filteredLanguages, filters, selectedLanguage } =
    useLanguageSelection();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playlistSession, setPlaylistSession] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Whether the user explicitly paused — prevents auto-resume on re-renders
  const userPausedRef = useRef(false);
  const playlistRef = useRef([]);
  // Single reusable Audio element; created once on first user gesture to satisfy
  // iOS Safari's requirement that audio be unlocked during a gesture handler
  const audioRef = useRef(null);
  const delayTimeoutRef = useRef(null);
  // isAutoplay is read inside an async callback (handleAudioEnded) so we mirror it
  // in a ref to always have the current value without stale closure issues
  const isAutoplayRef = useRef(isAutoplay);

  useEffect(() => {
    isAutoplayRef.current = isAutoplay;
  }, [isAutoplay]);

  // Must be called synchronously inside a user gesture handler (button click etc.)
  // iOS Safari will block audio.play() unless the Audio element was created and
  // triggered during a gesture. Subsequent src swaps on the same element are fine.
  const unlockAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      // Attempt silent play to register the element as gesture-unlocked on iOS.
      // The promise will reject (no src), that's expected and intentionally ignored.
      audio.play().catch(() => {});
      audioRef.current = audio;
    }
  }, []);

  const getSortedLanguageCodes = useCallback(() => {
    if (!data?.languageData) return [];

    const {
      languageCodes,
      languageLineages,
      speakerData,
      typologicalFeatures,
    } = getSortingData(data.languageData);

    let allLanguages = [...languageCodes];
    if (Object.keys(filters).length > 0 && filteredLanguages.size > 0) {
      allLanguages = allLanguages.filter((code) => filteredLanguages.has(code));
    }

    return sortLanguages({
      allLanguages,
      languageData: data.languageData,
      languageLineages,
      speakerData,
      typologicalFeatures,
      sortBy,
      labelContent,
      isReverse,
    });
  }, [data, sortBy, labelContent, isReverse, filters, filteredLanguages]);

  // Rebuild playlist when sorting/filtering changes
  useEffect(() => {
    const codes = getSortedLanguageCodes();
    playlistRef.current = codes;
    if (currentIndex >= codes.length) {
      setCurrentIndex(0);
    }
  }, [getSortedLanguageCodes, currentIndex]);

  const stopCurrentAudio = useCallback(() => {
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
    // Pause the shared audio element if it exists; don't null it out since we
    // reuse the same element for every track
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const startPlaylist = useCallback(() => {
    // Unlock must happen here, synchronously, while we're still in the gesture handler
    unlockAudio();
    const codes = getSortedLanguageCodes();
    if (codes.length === 0) return;
    playlistRef.current = codes;
    setIsPlaying(true);
    setPlaylistSession((s) => s + 1);
    userPausedRef.current = false;
    if (currentIndex >= codes.length || currentIndex < 0) {
      setCurrentIndex(0);
    }
  }, [getSortedLanguageCodes, currentIndex, unlockAudio]);

  const startFromLanguage = useCallback(
    (languageCode) => {
      // Same: unlock synchronously in the gesture handler
      unlockAudio();
      const codes = getSortedLanguageCodes();
      if (codes.length === 0) return;
      const index = codes.indexOf(languageCode);
      if (index === -1) return;
      playlistRef.current = codes;
      setCurrentIndex(index);
      setIsPlaying(true);
      setPlaylistSession((s) => s + 1);
    },
    [getSortedLanguageCodes, unlockAudio],
  );

  const pausePlaylist = useCallback(() => {
    setIsPlaying(false);
    setIsAnimating(false);
    userPausedRef.current = true;
    stopCurrentAudio();
  }, [stopCurrentAudio]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((index) => Math.max(0, index - 1));
    setPlaylistSession((s) => s + 1);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((index) => {
      const codes = playlistRef.current;
      return Math.min(codes.length - 1, index + 1);
    });
    setPlaylistSession((s) => s + 1);
  }, []);

  const goToBegin = useCallback(() => {
    setCurrentIndex(0);
    setPlaylistSession((s) => s + 1);
  }, []);

  const handleAudioEnded = useCallback(() => {
    if (isAutoplayRef.current) {
      const codes = playlistRef.current;
      setCurrentIndex((index) => {
        const nextIndex = index + 1;
        if (nextIndex >= codes.length) {
          // End of playlist: stop playback
          setIsPlaying(false);
          userPausedRef.current = true;
          return index;
        }
        return nextIndex;
      });
    } else {
      setIsPlaying(false);
      userPausedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (isMyMesha) {
      setIsPlaying(false);
      userPausedRef.current = false;
      stopCurrentAudio();
      return;
    }

    // Resume after switching back from MyMesha mode, unless the user had paused manually
    if (
      !isMyMesha &&
      selectedLanguage &&
      !isPlaying &&
      !userPausedRef.current
    ) {
      setIsPlaying(true);
      setPlaylistSession((s) => s + 1);
    }

    if (!isPlaying || !isSceneReady) return;

    const codes = playlistRef.current;
    if (codes.length === 0 || currentIndex >= codes.length) {
      setIsPlaying(false);
      return;
    }

    const code = codes[currentIndex];
    if (selectedLanguage !== code) {
      selectLanguage(code);
    }

    let cleanup = () => {};

    const playAudio = async () => {
      stopCurrentAudio();
      setIsAnimating(true);

      delayTimeoutRef.current = setTimeout(async () => {
        delayTimeoutRef.current = null;
        setIsAnimating(false);

        try {
          const { getLanguageAudioUrl, setupAudioVisualization } =
            await import("../services/audioService");
          const audioUrl = await getLanguageAudioUrl(code, isLuka);

          if (!audioUrl) {
            console.warn(`No audio available for language: ${code}`);
            handleAudioEnded();
            return;
          }

          // Reuse the single unlocked Audio element rather than creating a new one.
          // Creating new Audio() inside a setTimeout loses iOS gesture association.
          let audio = audioRef.current;
          if (!audio) {
            // Fallback: if somehow unlockAudio wasn't called, create it here.
            // This won't be gesture-unlocked on iOS but is better than crashing.
            audio = new Audio();
            audioRef.current = audio;
          }

          audio.pause();
          // Remove any ended listener from the previous track before swapping src
          audio.removeEventListener("ended", handleAudioEnded);
          audio.preload = "auto";
          audio.src = audioUrl;
          audio.volume = 0.5;
          // Calling load() after setting src initiates buffering
          audio.load();

          // Wait until the browser has enough data to start playback without clipping
          await new Promise((resolve, reject) => {
            const READY_THRESHOLD = 2; // HAVE_CURRENT_DATA
            let settled = false;

            const cleanupListeners = () => {
              audio.removeEventListener("canplaythrough", handleReady);
              audio.removeEventListener("canplay", handleReady);
              audio.removeEventListener("loadeddata", handleReady);
              audio.removeEventListener("error", handleError);
            };

            const settle = (fn) => {
              if (settled) return;
              settled = true;
              clearTimeout(timeoutId);
              cleanupListeners();
              fn();
            };

            const handleReady = () => {
              if (audio.readyState >= READY_THRESHOLD) settle(resolve);
            };

            const handleError = () => {
              settle(() =>
                reject(new Error(`Failed to load audio for ${code}`)),
              );
            };

            // Don't block forever on slow networks; proceed if minimum data is available
            const timeoutId = setTimeout(() => {
              if (audio.readyState >= READY_THRESHOLD) {
                settle(resolve);
              } else {
                settle(() =>
                  reject(
                    new Error(`Audio readiness timeout for language: ${code}`),
                  ),
                );
              }
            }, 3500);

            // Resolve immediately if already buffered enough (e.g. cached)
            if (audio.readyState >= READY_THRESHOLD) {
              settle(resolve);
              return;
            }

            audio.addEventListener("canplaythrough", handleReady);
            audio.addEventListener("canplay", handleReady);
            audio.addEventListener("loadeddata", handleReady);
            audio.addEventListener("error", handleError);
          });

          await setupAudioVisualization(audio);

          audio.addEventListener("ended", handleAudioEnded);
          cleanup = () => {
            audio.removeEventListener("ended", handleAudioEnded);
          };

          await audio.play();
        } catch (error) {
          console.error("Error playing language audio:", error);
          handleAudioEnded();
        }
      }, switchDuration);
    };

    playAudio();

    return () => {
      cleanup();
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
        delayTimeoutRef.current = null;
      }
    };
  }, [
    isPlaying,
    currentIndex,
    playlistSession,
    isSceneReady,
    isMyMesha,
    isLuka,
    switchDuration,
    stopCurrentAudio,
    handleAudioEnded,
    selectLanguage,
    selectedLanguage,
  ]);

  useEffect(() => {
    return () => {
      stopCurrentAudio();
    };
  }, [stopCurrentAudio]);

  const getCurrentLanguage = useCallback(() => {
    const codes = playlistRef.current;
    if (currentIndex >= 0 && currentIndex < codes.length) {
      return codes[currentIndex];
    }
    return null;
  }, [currentIndex]);

  const value = {
    isPlaying,
    isAnimating,
    currentIndex,
    playlistLength: playlistRef.current.length,
    startPlaylist,
    startFromLanguage,
    pausePlaylist,
    goToPrev,
    goToNext,
    goToBegin,
    getCurrentLanguage,
    audioRef,
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
};
