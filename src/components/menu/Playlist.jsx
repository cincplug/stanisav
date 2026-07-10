import { useEffect, useRef } from "react";
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
  const { isAutoplay } = config;
  const playButtonRef = useRef(null);

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
          isPlaying ? pausePlaylist() : startPlaylist();
          break;
        case "k":
          if (isOnInteractiveElement) break;
          isPlaying ? pausePlaylist() : startPlaylist();
          break;
        case "ArrowLeft":
          if (isOnInteractiveElement) break;
          e.preventDefault();
          goToPrev();
          break;
        case "ArrowRight":
          if (isOnInteractiveElement) break;
          e.preventDefault();
          goToNext();
          break;
        case "Home":
          if (isOnInteractiveElement) break;
          e.preventDefault();
          goToBegin();
          break;
        case "s":
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
  }, [isPlaying, isAutoplay]);

  const toggleLoop = () => updateConfigValue("global.isAutoplay", !isAutoplay);

  const handleStop = () => {
    pausePlaylist();
    viewAllLanguages();
    // Restore focus to the play button so keyboard users aren't left stranded
    // when the stop button disappears from the DOM
    playButtonRef.current?.focus();
  };

  const playLabel = isPlaying ? t("playlist.pause") : t("playlist.play");
  const playIcon = isPlaying ? <PauseIcon /> : <PlayIcon />;

  return (
    <div
      className={`playlist-controls ${selectedLanguage ? "zoomed" : "not-zoomed"}`}
      role="group"
      aria-label={t("playlist.controls")}
    >
      <button onClick={handleStop} aria-label={t("menu.back")}>
        <HomeIcon />
      </button>
      <button
        onClick={goToPrev}
        aria-label={t("playlist.previous")}
        disabled={!selectedLanguage}
      >
        <PrevIcon className="prev-icon" />
      </button>
      <button
        ref={playButtonRef}
        className="playlist-main"
        onClick={isPlaying ? pausePlaylist : startPlaylist}
        aria-label={playLabel}
        aria-pressed={isPlaying}
      >
        {playIcon}
      </button>
      <button
        onClick={goToNext}
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
