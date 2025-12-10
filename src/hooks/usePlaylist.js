import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguageSelection } from "../contexts/LanguageSelectionContext";
import { useLanguageSelectionHandler } from "./useLanguageSelectionHandler";

export function usePlaylist({
  data,
  sceneReady,
  appControls,
  handleCameraFocus,
  selectedLanguage
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playlistSession, setPlaylistSession] = useState(0);
  const playlistRef = useRef([]);
  const audioRef = useRef(null);
  const lastPlaylistLanguage = useRef(null);

  const { playLanguageAudio, stopCurrentAudio } = useLanguageSelection();
  const { selectLanguageWithFocus } = useLanguageSelectionHandler(
    handleCameraFocus,
    sceneReady,
    data,
    appControls
  );

  const getSortedLanguageCodes = useCallback(() => {
    if (!data?.languageData) return [];
    return Object.entries(data.languageData)
      .sort(([, a], [, b]) => (a.name || "").localeCompare(b.name || ""))
      .map(([code]) => code);
  }, [data]);

  const startPlaylist = useCallback(async () => {
    const codes = getSortedLanguageCodes();
    if (codes.length === 0) return;
    await stopCurrentAudio();
    playlistRef.current = codes;
    setIsPlaying(true);
    setPlaylistSession((s) => s + 1);
    // Don't reset currentIndex if resuming
    if (currentIndex >= codes.length || currentIndex < 0) {
      setCurrentIndex(0);
    }
  }, [getSortedLanguageCodes, stopCurrentAudio, currentIndex]);

  const pausePlaylist = useCallback(() => {
    setIsPlaying(false);
    stopCurrentAudio();
    if (audioRef.current) {
      audioRef.current.removeEventListener("ended", handleAudioEnded);
      audioRef.current = null;
    }
  }, [stopCurrentAudio]);

  // Optional: reset to beginning
  const resetPlaylist = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
    stopCurrentAudio();
    if (audioRef.current) {
      audioRef.current.removeEventListener("ended", handleAudioEnded);
      audioRef.current = null;
    }
  }, [stopCurrentAudio]);

  const handleAudioEnded = useCallback(() => {
    setCurrentIndex((idx) => idx + 1);
  }, []);

  // Go to previous sample
  const goToPrev = useCallback(() => {
    setCurrentIndex((idx) => Math.max(0, idx - 1));
    setPlaylistSession((s) => s + 1);
  }, []);

  // Go to next sample
  const goToNext = useCallback(() => {
    setCurrentIndex((idx) => Math.min(playlistRef.current.length - 1, idx + 1));
    setPlaylistSession((s) => s + 1);
  }, []);

  // Go to beginning
  const goToBegin = useCallback(() => {
    setCurrentIndex(0);
    setPlaylistSession((s) => s + 1);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const codes = playlistRef.current;
    if (currentIndex >= codes.length) {
      setIsPlaying(false);
      setCurrentIndex(0);
      return;
    }

    const code = codes[currentIndex];
    lastPlaylistLanguage.current = code;

    let cleanup = () => {};

    (async () => {
      await stopCurrentAudio();
      selectLanguageWithFocus(code, false, true);

      const audio = await playLanguageAudio(code);
      if (audio) {
        audioRef.current = audio;
        audio.addEventListener("ended", handleAudioEnded);
        cleanup = () => {
          audio.removeEventListener("ended", handleAudioEnded);
        };
      }
    })();

    return () => {
      cleanup();
    };
  }, [isPlaying, currentIndex, playlistSession]);

  useEffect(() => {
    if (
      isPlaying &&
      selectedLanguage &&
      selectedLanguage !== lastPlaylistLanguage.current
    ) {
      pausePlaylist();
    }
  }, [selectedLanguage]);

  useEffect(() => {
    if (!isPlaying) {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleAudioEnded);
        audioRef.current = null;
      }
    }
  }, [isPlaying, handleAudioEnded]);

  return {
    isPlaying,
    startPlaylist,
    pausePlaylist,
    resetPlaylist,
    goToPrev,
    goToNext,
    goToBegin,
    currentIndex,
    playlistLength: playlistRef.current.length
  };
}
