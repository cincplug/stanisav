import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguageSelection } from "../contexts/LanguageSelectionContext";
import { useLanguageSelectionHandler } from "./useLanguageSelectionHandler";

export function usePlaylist({
  data,
  sceneReady,
  sceneControls,
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
    sceneControls
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
    setCurrentIndex(0);
    setIsPlaying(true);
    setPlaylistSession((s) => s + 1);
  }, [getSortedLanguageCodes, stopCurrentAudio]);

  const stopPlaylist = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    stopCurrentAudio();
    if (audioRef.current) {
      audioRef.current.removeEventListener("ended", handleAudioEnded);
      audioRef.current = null;
    }
  }, [stopCurrentAudio]);

  const handleAudioEnded = useCallback(() => {
    setCurrentIndex((idx) => idx + 1);
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
      stopPlaylist();
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
    stopPlaylist
  };
}
