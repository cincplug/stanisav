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

const PlaylistContext = createContext(null);

export const PlaylistProvider = ({ children }) => {
  const { data, sceneReady } = useAppState();
  const { controls } = useControls();
  const { selectLanguage, filteredLanguages, filteringUtils, resetCameraView } =
    useLanguageSelection();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playlistSession, setPlaylistSession] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const playlistRef = useRef([]);
  const audioRef = useRef(null);
  const currentAudioElement = useRef(null);
  const delayTimeoutRef = useRef(null);
  const isLoopRef = useRef(controls.isLoop);

  useEffect(() => {
    isLoopRef.current = controls.isLoop;
  }, [controls.isLoop]);

  const getSortedLanguageCodes = useCallback(() => {
    if (!data?.languageData) return [];
    const { languageData, languageGroups, speakerData, typologicalFeatures } =
      data;
    const { sortLanguagesBy, labelContent, isReverse } = controls;
    let allLanguages = Object.keys(data.languageData);

    // Filter by active filters if any
    if (Object.keys(filteringUtils).length > 0 && filteredLanguages.size > 0) {
      allLanguages = allLanguages.filter((code) => filteredLanguages.has(code));
    }

    return sortLanguages({
      allLanguages,
      languageData,
      languageGroups,
      speakerData,
      typologicalFeatures,
      sortLanguagesBy,
      labelContent,
      isReverse,
    });
  }, [data, controls, filteringUtils, filteredLanguages]);

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
    [getSortedLanguageCodes]
  );

  const pausePlaylist = useCallback(() => {
    setIsPlaying(false);
    setIsAnimating(false);
    stopCurrentAudio();
  }, [stopCurrentAudio]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((idx) => Math.max(0, idx - 1));
    if (controls.isLoop) {
      setPlaylistSession((s) => s + 1);
    }
  }, [controls.isLoop]);

  const goToNext = useCallback(() => {
    setCurrentIndex((idx) => {
      const codes = playlistRef.current;
      return Math.min(codes.length - 1, idx + 1);
    });
    if (controls.isLoop) {
      setPlaylistSession((s) => s + 1);
    }
  }, [controls.isLoop]);

  const goToBegin = useCallback(() => {
    setCurrentIndex(0);
    if (controls.isLoop) {
      setPlaylistSession((s) => s + 1);
    }
  }, [controls.isLoop]);

  const handleAudioEnded = useCallback(() => {
    if (isLoopRef.current) {
      const codes = playlistRef.current;
      setCurrentIndex((idx) => {
        const nextIdx = idx + 1;
        if (nextIdx >= codes.length) {
          return 0;
        }
        return nextIdx;
      });
    } else {
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (!isPlaying || !sceneReady) return;

    const codes = playlistRef.current;
    if (codes.length === 0 || currentIndex >= codes.length) {
      setIsPlaying(false);
      return;
    }

    const code = codes[currentIndex];
    selectLanguage(code);

    let cleanup = () => {};

    const playAudio = async () => {
      const { isLuka, animationDuration } = controls;

      stopCurrentAudio();
      setIsAnimating(true);

      delayTimeoutRef.current = setTimeout(async () => {
        delayTimeoutRef.current = null;
        setIsAnimating(false);

        try {
          const { getLanguageAudioUrl, setupAudioVisualization } = await import(
            "../services/audioService"
          );
          const audioUrl = await getLanguageAudioUrl(code, isLuka);

          if (!audioUrl) {
            console.warn(`No audio available for language: ${code}`);
            handleAudioEnded();
            return;
          }

          const audio = new Audio(audioUrl);
          audio.volume = 0.5;
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
      }, animationDuration);
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
    controls,
    stopCurrentAudio,
    handleAudioEnded,
    selectLanguage,
  ]);

  useEffect(() => {
    const codes = getSortedLanguageCodes();
    playlistRef.current = codes;
    setCurrentIndex(0);

    // Stop playlist and reset camera when filters change
    if (isPlaying) {
      pausePlaylist();
      resetCameraView();
    }
  }, [
    controls?.sortLanguagesBy,
    controls?.labelContent,
    controls?.isReverse,
    getSortedLanguageCodes,
    filteringUtils,
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
