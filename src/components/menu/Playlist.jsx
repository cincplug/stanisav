import { useCallback, useEffect, useRef, useState } from "react";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useI18nContext } from "../../contexts/I18nContext";
import { useLanguageSelectionContext } from "../../contexts/LanguageSelectionContext";
import { usePlaylistContext } from "../../contexts/PlaylistContext";
import {
  LoopIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  HomeIcon,
} from "../Icons";
import "./Playlist.css";

export default function Playlist() {
  const { t } = useI18nContext();
  const { selectedLanguage, viewAllLanguages } = useLanguageSelectionContext();
  const {
    isPlaying,
    startPlaylist,
    pausePlaylist,
    goToPrev,
    goToNext,
    goToBegin,
  } = usePlaylistContext();

  const { config, updateConfigValue } = useConfigContext();
  const { isAutoplay, playlistHideTimeout } = config;
  const playButtonRef = useRef(null);
  const controlsRef = useRef(null);
  const isPlaylistActive = Boolean(selectedLanguage);
  const shouldPauseAudio = isPlaying;
  const [areControlsIdle, setAreControlsIdle] = useState(false);

  useEffect(() => {
    const canHoverWithMouse = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    if (!isPlaylistActive || !canHoverWithMouse) {
      setAreControlsIdle(false);
      return;
    }

    let hideTimeout;
    const hideAfterInactivity = () => {
      window.clearTimeout(hideTimeout);
      hideTimeout = window.setTimeout(() => {
        if (!controlsRef.current?.matches(":hover")) {
          setAreControlsIdle(true);
        }
      }, playlistHideTimeout);
    };
    const handlePointerMove = (event) => {
      if (event.pointerType !== "mouse") return;
      setAreControlsIdle(false);
      if (controlsRef.current?.matches(":hover")) {
        window.clearTimeout(hideTimeout);
        return;
      }
      hideAfterInactivity();
    };

    hideAfterInactivity();
    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.clearTimeout(hideTimeout);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [isPlaylistActive]);

  const handleStop = () => {
    pausePlaylist();
    viewAllLanguages();
    playButtonRef.current?.focus();
  };

  const handlePrevious = useCallback(() => {
    goToPrev();
    if (isPlaylistActive && !isPlaying) startPlaylist();
  }, [goToPrev, isPlaylistActive, isPlaying, startPlaylist]);

  const handleNext = useCallback(() => {
    goToNext();
    if (isPlaylistActive && !isPlaying) startPlaylist();
  }, [goToNext, isPlaylistActive, isPlaying, startPlaylist]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isOnRangeInput = e.target.matches('input[type="range"]');
      const isOnInteractiveElement = e.target.matches(
        "input, textarea, select, button, a",
      );

      // Range inputs don't natively use Space (browsers just scroll the page),
      // so let our play/pause shortcut claim it instead of falling through.
      // Every other interactive element keeps native Space/Enter behavior.
      if (isOnInteractiveElement && !isOnRangeInput && e.key !== "l") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          shouldPauseAudio ? pausePlaylist() : startPlaylist();
          break;
        case "k":
          if (isOnInteractiveElement) break;
          shouldPauseAudio ? pausePlaylist() : startPlaylist();
          break;
        case "ArrowLeft":
          if (isOnInteractiveElement) break;
          e.preventDefault();
          handlePrevious();
          break;
        case "ArrowRight":
          if (isOnInteractiveElement) break;
          e.preventDefault();
          handleNext();
          break;
        case "Home":
          if (isOnInteractiveElement) break;
          e.preventDefault();
          goToBegin();
          break;
        case "s":
        case "Escape":
          if (isOnInteractiveElement) break;
          e.preventDefault();
          handleStop();
          break;
        case "l":
          e.preventDefault();
          updateConfigValue("global.isAutoplay", !isAutoplay);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    shouldPauseAudio,
    isAutoplay,
    pausePlaylist,
    startPlaylist,
    goToPrev,
    goToNext,
    isPlaylistActive,
    isPlaying,
    handlePrevious,
    handleNext,
    goToBegin,
    handleStop,
    updateConfigValue,
  ]);

  const toggleLoop = () => updateConfigValue("global.isAutoplay", !isAutoplay);

  const playLabel = shouldPauseAudio ? t("playlist.pause") : t("playlist.play");
  const playIcon = shouldPauseAudio ? <PauseIcon /> : <PlayIcon />;

  return (
    <div
      ref={controlsRef}
      className={`playlist-controls ${selectedLanguage ? "zoomed" : "not-zoomed"}${areControlsIdle ? " is-idle" : ""}`}
      role="group"
      aria-label={t("playlist.controls")}
    >
      <button
        onClick={handleStop}
        aria-label={t("menu.back")}
        disabled={!selectedLanguage}
      >
        <HomeIcon />
      </button>
      <button
        onClick={handlePrevious}
        aria-label={t("playlist.previous")}
        disabled={!selectedLanguage}
      >
        <PrevIcon className="prev-icon" />
      </button>
      <button
        ref={playButtonRef}
        className="playlist-main"
        onClick={shouldPauseAudio ? pausePlaylist : startPlaylist}
        aria-label={playLabel}
        aria-pressed={shouldPauseAudio}
      >
        {playIcon}
      </button>
      <button
        onClick={handleNext}
        aria-label={t("playlist.next")}
        disabled={!selectedLanguage}
      >
        <NextIcon className="next-icon" />
      </button>
      <button
        onClick={toggleLoop}
        aria-label={t("controls.isAutoplay.label")}
        aria-pressed={isAutoplay}
        className={isAutoplay ? "selected" : ""}
        disabled={!selectedLanguage}
      >
        <LoopIcon selected={isAutoplay} />
      </button>
    </div>
  );
}
