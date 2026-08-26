import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { playAudioSequence } from "../services/audioPlaybackService";
import { useConfigContext } from "./ConfigContext";
import { useLanguageSelectionContext } from "./LanguageSelectionContext";
import { useSortedLanguages } from "../hooks/useSortedLanguages";

const PlaylistContext = createContext(null);

export const PlaylistProvider = ({ children }) => {
  const { config } = useConfigContext();
  const { isMyStanisav, isAutoplay, soundSource, switchDuration } = config;
  const {
    filteredLanguages,
    filters,
    selectedLanguage,
    setSelectedLanguage,
    viewAllLanguages,
  } = useLanguageSelectionContext();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playlistSession, setPlaylistSession] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  // Index of the audio URL currently playing within the sequence for a language:
  // 0 = first sample (original or luka depending on soundSource), 1 = second sample
  const [audioPhaseIndex, setAudioPhaseIndex] = useState(0);
  const [isCurrentSampleLuka, setIsCurrentSampleLuka] = useState(false);

  const userPausedRef = useRef(false);
  const playlistRef = useRef([]);
  const audioRef = useRef(null);
  const delayTimeoutRef = useRef(null);
  const animatingTimeoutRef = useRef(null);
  const isAutoplayRef = useRef(isAutoplay);
  // True when replaying the same language index (resume/MyStanisav return),
  // false on every actual language change; controls whether startDelay is applied
  const isResumeRef = useRef(false);

  // Get sorted language codes - accounts for current locale
  const allSortedLanguageCodes = useSortedLanguages();

  // Apply filtering if active filters exist
  const sortedLanguageCodes = useMemo(() => {
    if (
      !filteredLanguages ||
      filteredLanguages.size === 0 ||
      !filters ||
      Object.keys(filters).length === 0
    ) {
      return allSortedLanguageCodes;
    }
    // Filtering is active: return only languages in filteredLanguages, but in sorted order
    return allSortedLanguageCodes.filter((code) => filteredLanguages.has(code));
  }, [allSortedLanguageCodes, filteredLanguages, filters]);

  useEffect(() => {
    isAutoplayRef.current = isAutoplay;
  }, [isAutoplay]);

  const unlockAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.play().catch(() => {});
      audioRef.current = audio;
    }
  }, []);

  useEffect(() => {
    playlistRef.current = sortedLanguageCodes;
  }, [sortedLanguageCodes]);

  // Separate effect: reset currentIndex when sort order changes
  // This ensures the playlist restarts from the beginning when locale or sort config changes
  useEffect(() => {
    if (
      sortedLanguageCodes.length > 0 &&
      currentIndex >= sortedLanguageCodes.length
    ) {
      setCurrentIndex(0);
    }
  }, [sortedLanguageCodes, currentIndex]);

  const stopCurrentAudio = useCallback(() => {
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const startPlaylist = useCallback(() => {
    unlockAudio();
    const codes = playlistRef.current;
    if (codes.length === 0) return;
    isResumeRef.current = false;
    setIsPlaying(true);
    setPlaylistSession((s) => s + 1);
    userPausedRef.current = false;
    if (currentIndex >= codes.length || currentIndex < 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, unlockAudio]);

  const startFromLanguage = useCallback(
    (languageCode) => {
      unlockAudio();
      const codes = playlistRef.current;
      if (codes.length === 0) return;
      const index = codes.indexOf(languageCode);
      if (index === -1) return;
      isResumeRef.current = false;
      setCurrentIndex(index);
      setIsPlaying(true);
      setPlaylistSession((s) => s + 1);
    },
    [unlockAudio],
  );

  const pausePlaylist = useCallback(() => {
    setIsPlaying(false);
    setIsCurrentSampleLuka(false);
    userPausedRef.current = true;
    stopCurrentAudio();
  }, [stopCurrentAudio]);

  const goToPrev = useCallback(() => {
    isResumeRef.current = false;
    setCurrentIndex((index) => Math.max(0, index - 1));
    setPlaylistSession((s) => s + 1);
  }, []);

  const goToNext = useCallback(() => {
    isResumeRef.current = false;
    setCurrentIndex((index) => {
      const codes = playlistRef.current;
      return Math.min(codes.length - 1, index + 1);
    });
    setPlaylistSession((s) => s + 1);
  }, []);

  const goToBegin = useCallback(() => {
    isResumeRef.current = false;
    setCurrentIndex(0);
    setPlaylistSession((s) => s + 1);
  }, []);

  const handleAudioEnded = useCallback(() => {
    if (isAutoplayRef.current) {
      const codes = playlistRef.current;
      setCurrentIndex((index) => {
        const nextIndex = index + 1;
        if (nextIndex >= codes.length) {
          setIsPlaying(false);
          setIsCurrentSampleLuka(false);
          userPausedRef.current = true;
          viewAllLanguages();
          return index;
        }
        // Advancing to next language: apply switch delay in the playback effect
        isResumeRef.current = false;
        return nextIndex;
      });
    } else {
      setIsPlaying(false);
      setIsCurrentSampleLuka(false);
      userPausedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (isMyStanisav) {
      setIsPlaying(false);
      setIsCurrentSampleLuka(false);
      userPausedRef.current = false;
      stopCurrentAudio();
      return;
    }

    if (
      !isMyStanisav &&
      selectedLanguage &&
      !isPlaying &&
      !userPausedRef.current
    ) {
      // Returning to the same language after MyStanisav: resume without switch delay
      isResumeRef.current = true;
      setIsPlaying(true);
      setPlaylistSession((s) => s + 1);
    }

    if (!isPlaying) return;

    const codes = playlistRef.current;
    if (codes.length === 0 || currentIndex >= codes.length) {
      setIsPlaying(false);
      return;
    }

    const code = codes[currentIndex];
    if (selectedLanguage !== code) {
      setSelectedLanguage(code);
      if (animatingTimeoutRef.current)
        clearTimeout(animatingTimeoutRef.current);
      setIsAnimating(true);
      animatingTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        animatingTimeoutRef.current = null;
      }, switchDuration);
    }

    let isEffectActive = true;

    const playAudio = async () => {
      stopCurrentAudio();

      const startDelay = isResumeRef.current ? 0 : switchDuration;

      delayTimeoutRef.current = setTimeout(async () => {
        delayTimeoutRef.current = null;

        try {
          const { getLanguageAudioUrls } =
            await import("../services/audioUrlResolverService");
          const audioUrls = await getLanguageAudioUrls(code, soundSource);

          if (audioUrls.length === 0) {
            console.warn(`No audio available for language: ${code}`);
            setIsCurrentSampleLuka(false);
            handleAudioEnded();
            return;
          }

          let audio = audioRef.current;
          if (!audio) {
            audio = new Audio();
            audioRef.current = audio;
          }

          await playAudioSequence({
            audio,
            audioUrls,
            config,
            delayDuration: switchDuration,
            shouldContinue: () => isEffectActive,
            onPhaseChange: (phaseIndex, audioUrl) => {
              setAudioPhaseIndex(phaseIndex);
              setIsCurrentSampleLuka(Boolean(audioUrl?.endsWith("-luka.mp3")));
            },
          });

          if (isEffectActive) {
            handleAudioEnded();
          }
        } catch (error) {
          console.error("Error playing language audio:", error);
          setIsCurrentSampleLuka(false);
          if (isEffectActive) {
            handleAudioEnded();
          }
        }
      }, startDelay);
    };

    playAudio();

    return () => {
      isEffectActive = false;
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleAudioEnded);
      }
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
        delayTimeoutRef.current = null;
      }
    };
  }, [
    isPlaying,
    currentIndex,
    playlistSession,
    isMyStanisav,
    soundSource,
    switchDuration,
    stopCurrentAudio,
    handleAudioEnded,
    selectedLanguage,
    setSelectedLanguage,
  ]);

  useEffect(() => {
    return () => {
      stopCurrentAudio();
      if (animatingTimeoutRef.current)
        clearTimeout(animatingTimeoutRef.current);
    };
  }, [stopCurrentAudio]);

  // Language the cursor currently points to, independent of isPlaying or
  // selectedLanguage - this is what UI should render as the navigation cursor
  const previewLanguageCode = useMemo(() => {
    return sortedLanguageCodes[currentIndex] ?? null;
  }, [sortedLanguageCodes, currentIndex]);

  const getCurrentLanguage = useCallback(() => {
    return previewLanguageCode;
  }, [previewLanguageCode]);

  // Moves the cursor to a language without starting playback or changing
  // selectedLanguage - used when the cursor should follow external focus
  // (e.g. tabbing through LanguagesTab)
  const setPreviewToLanguage = useCallback((languageCode) => {
    const codes = playlistRef.current;
    const index = codes.indexOf(languageCode);
    if (index === -1) return;
    isResumeRef.current = false;
    setCurrentIndex(index);
  }, []);

  const value = {
    isPlaying,
    isAnimating,
    audioPhaseIndex,
    isCurrentSampleLuka,
    currentIndex,
    previewLanguageCode,
    playlistLength: playlistRef.current.length,
    startPlaylist,
    startFromLanguage,
    pausePlaylist,
    goToPrev,
    goToNext,
    goToBegin,
    getCurrentLanguage,
    setPreviewToLanguage,
    audioRef,
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylistContext = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
};
