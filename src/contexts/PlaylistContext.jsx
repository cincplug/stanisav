import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useAppState } from "./AppStateContext";
import { useControls } from "./ControlsContext";
import { useLanguageSelection } from "./LanguageSelectionContext";
import { sortLanguages } from "../utils/sortingUtils";
import { getSortingData } from "../utils/sortingUtils";

const PlaylistContext = createContext(null);

export const PlaylistProvider = ({ children }) => {
  const { data, sceneReady } = useAppState();
  const { controls, updateControl } = useControls();
  const {
    isLoop,
    isMyMesha,
    isLuka,
    switchDuration,
    sortBy,
    labelContent,
    isReverse,
  } = controls;
  const {
    selectLanguage,
    filteredLanguages,
    filteringUtils,
    selectedLanguage,
  } = useLanguageSelection();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playlistSession, setPlaylistSession] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  // Track if user explicitly paused (not via isMyMesha)
  const userPausedRef = useRef(false);
  const playlistRef = useRef([]);
  const audioRef = useRef(null);
  const currentAudioElement = useRef(null);
  const delayTimeoutRef = useRef(null);
  const isLoopRef = useRef(isLoop);

  useEffect(() => {
    isLoopRef.current = isLoop;
  }, [isLoop]);

  const getSortedLanguageCodes = useCallback(() => {
    if (!data?.languageData) return [];

    const {
      languageCodes,
      languageLineages,
      speakerData,
      typologicalFeatures,
    } = getSortingData(data.languageData);

    let allLanguages = [...languageCodes];
    // Filter by selected filters if any
    if (Object.keys(filteringUtils).length > 0 && filteredLanguages.size > 0) {
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
  }, [
    data,
    sortBy,
    labelContent,
    isReverse,
    filteringUtils,
    filteredLanguages,
  ]);

  // Update playlist when sorting/filtering changes
  useEffect(() => {
    const codes = getSortedLanguageCodes();
    playlistRef.current = codes;

    // Validate current index
    if (currentIndex >= codes.length) {
      setCurrentIndex(0);
    }
  }, [getSortedLanguageCodes, currentIndex]);

  const stopCurrentAudio = useCallback(() => {
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
    if (currentAudioElement.current) {
      currentAudioElement.current.pause();
      currentAudioElement.current.currentTime = 0;
      currentAudioElement.current = null;
    }
  }, []);

  const startPlaylist = useCallback(() => {
    const codes = getSortedLanguageCodes();
    if (codes.length === 0) return;
    playlistRef.current = codes;
    setIsPlaying(true);
    setPlaylistSession((s) => s + 1);
    userPausedRef.current = false;
    if (currentIndex >= codes.length || currentIndex < 0) {
      setCurrentIndex(0);
    }
  }, [getSortedLanguageCodes, currentIndex]);

  const startFromLanguage = useCallback(
    (languageCode) => {
      const codes = getSortedLanguageCodes();
      if (codes.length === 0) return;
      const index = codes.indexOf(languageCode);
      if (index === -1) return;
      playlistRef.current = codes;
      setCurrentIndex(index);
      setIsPlaying(true);
      setPlaylistSession((s) => s + 1);
    },
    [getSortedLanguageCodes],
  );

  const pausePlaylist = useCallback(() => {
    setIsPlaying(false);
    setIsAnimating(false);
    userPausedRef.current = true;
    stopCurrentAudio();
  }, [stopCurrentAudio]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((index) => Math.max(0, index - 1));
    if (isLoop) {
      setPlaylistSession((s) => s + 1);
    }
  }, [isLoop]);

  const goToNext = useCallback(() => {
    setCurrentIndex((index) => {
      const codes = playlistRef.current;
      return Math.min(codes.length - 1, index + 1);
    });
    if (isLoop) {
      setPlaylistSession((s) => s + 1);
    }
  }, [isLoop]);

  const goToBegin = useCallback(() => {
    setCurrentIndex(0);
    if (isLoop) {
      setPlaylistSession((s) => s + 1);
    }
  }, [isLoop]);

  const handleAudioEnded = useCallback(() => {
    if (isLoopRef.current) {
      const codes = playlistRef.current;
      setCurrentIndex((index) => {
        const nextIndex = index + 1;
        if (nextIndex >= codes.length) {
          return 0;
        }
        return nextIndex;
      });
    } else {
      // When not looping, treat audio end as user pause to prevent auto-resume
      setIsPlaying(false);
      userPausedRef.current = true;
    }
  }, []);

  useEffect(() => {
    // If switching to MyMesha, always pause playlist and audio
    if (isMyMesha) {
      setIsPlaying(false);
      userPausedRef.current = false; // reset user pause on mode switch
      stopCurrentAudio();
      return;
    }
    // If switching from MyMesha to playlist mode, only resume if not user-paused
    if (
      !isMyMesha &&
      selectedLanguage &&
      !isPlaying &&
      !userPausedRef.current
    ) {
      setIsPlaying(true);
      setPlaylistSession((s) => s + 1);
    }
    // If user paused, do not auto-resume
    if (!isPlaying || !sceneReady) return;

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

          const audio = new Audio(audioUrl);
          audio.volume = 0.5;
          audio.preload = "auto";

          // Wait until the browser can start playback reliably to reduce clipped starts.
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
              if (audio.readyState >= READY_THRESHOLD) {
                settle(resolve);
              }
            };

            const handleError = () => {
              settle(() =>
                reject(new Error(`Failed to load audio for ${code}`)),
              );
            };

            // Do not block forever on poor networks; proceed once minimum data is available.
            const timeoutId = setTimeout(() => {
              if (audio.readyState >= READY_THRESHOLD) {
                settle(resolve);
                return;
              }
              settle(() =>
                reject(
                  new Error(`Audio readiness timeout for language: ${code}`),
                ),
              );
            }, 3500);

            if (audio.readyState >= READY_THRESHOLD) {
              settle(resolve);
              return;
            }

            audio.addEventListener("canplaythrough", handleReady);
            audio.addEventListener("canplay", handleReady);
            audio.addEventListener("loadeddata", handleReady);
            audio.addEventListener("error", handleError);

            audio.load();
          });

          await setupAudioVisualization(audio);

          currentAudioElement.current = audio;
          audioRef.current = audio;

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
    sceneReady,
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
