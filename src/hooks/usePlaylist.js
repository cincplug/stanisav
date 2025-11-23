import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguageSelection } from "../contexts/LanguageSelectionContext";
import { useLanguageSelectionHandler } from "./useLanguageSelectionHandler";

/**
 * usePlaylist
 * Handles sequential playback of language samples as a playlist.
 * @param {object} params
 *   - data: language data object
 *   - sceneReady: boolean
 *   - sceneControls: object
 *   - handleCameraFocus: function
 *   - showsVideoPreviews: boolean (optional, for UI)
 */
export function usePlaylist({
  data,
  sceneReady,
  sceneControls,
  handleCameraFocus
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const playlistRef = useRef([]);
  const audioRef = useRef(null);

  const { playLanguageAudio, stopCurrentAudio } = useLanguageSelection();
  const { selectLanguageWithFocus } = useLanguageSelectionHandler(
    handleCameraFocus,
    sceneReady,
    data,
    sceneControls
  );

  // Build sorted language list (by English name)
  const getSortedLanguageCodes = useCallback(() => {
    if (!data?.languageData) return [];
    return Object.entries(data.languageData)
      .sort(([, a], [, b]) =>
        (a.englishName || "").localeCompare(b.englishName || "")
      )
      .map(([code]) => code);
  }, [data]);

  // Start playlist
  const startPlaylist = useCallback(() => {
    const codes = getSortedLanguageCodes();
    if (codes.length === 0) return;
    playlistRef.current = codes;
    setCurrentIndex(0);
    setIsPlaying(true);
  }, [getSortedLanguageCodes]);

  // Stop playlist
  const stopPlaylist = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    stopCurrentAudio();
    if (audioRef.current) {
      audioRef.current.removeEventListener("ended", handleAudioEnded);
      audioRef.current = null;
    }
  }, [stopCurrentAudio]);

  // Handle audio ended event
  const handleAudioEnded = useCallback(() => {
    setCurrentIndex((idx) => idx + 1);
  }, []);

  // Effect: Play current language when playlist is active
  useEffect(() => {
    if (!isPlaying) return;

    const codes = playlistRef.current;
    if (currentIndex >= codes.length) {
      setIsPlaying(false);
      setCurrentIndex(0);
      return;
    }

    const code = codes[currentIndex];

    let cleanup = () => {};

    (async () => {
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
    // eslint-disable-next-line
  }, [isPlaying, currentIndex]);

  // If playlist is stopped externally, clean up
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
