import { useEffect } from "react";
import { usePlaylist } from "../../contexts/PlaylistContext";
import { useControls } from "../../contexts/ControlsContext";
import {
  PlayIcon,
  PauseIcon,
  BeginIcon,
  PrevIcon,
  NextIcon,
  LoopIcon,
  StopIcon,
} from "./MenuIcons";
import { useI18n } from "../../contexts/I18nContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import "./Playlist.css";

export default function Playlist() {
  const { t } = useI18n();
  const { viewAllLanguages } = useLanguageSelection();
  const {
    isPlaying,
    startPlaylist,
    pausePlaylist,
    goToPrev,
    goToNext,
    goToBegin,
  } = usePlaylist();

  const { controls, updateControl } = useControls();

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if focus is on any interactive element
      if (e.target.matches("input, textarea, select, button, a")) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          isPlaying ? pausePlaylist() : startPlaylist();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goToPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          goToNext();
          break;
        case "Home":
          e.preventDefault();
          goToBegin();
          break;
        case "l":
          e.preventDefault();
          updateControl("isLoop", !controls.isLoop);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, controls.isLoop]);

  const playLabel = isPlaying ? t("playlist.pause") : t("playlist.play");
  const playIcon = isPlaying ? <PauseIcon /> : <PlayIcon />;

  const toggleLoop = () => updateControl("isLoop", !controls.isLoop);

  // Stop button handler: same as viewAll in FiltersTab
  const handleStop = () => {
    pausePlaylist();
    viewAllLanguages();
  };

  return (
    <div
      className="playlist-controls"
      role="group"
      aria-label={t("playlist.controls")}
    >
      <button onClick={goToBegin} aria-label={t("playlist.goToBeginning")}>
        <BeginIcon className="begin-icon" />
      </button>
      <button onClick={goToPrev} aria-label={t("playlist.previous")}>
        <PrevIcon className="prev-icon" />
      </button>
      <button
        className="playlist-main"
        onClick={isPlaying ? pausePlaylist : startPlaylist}
        aria-label={playLabel}
        aria-pressed={isPlaying}
      >
        {playIcon}
      </button>
      <button
        onClick={handleStop}
        aria-label={t("playlist.stop")}
        className="stop-icon"
      >
        <StopIcon />
      </button>
      <button onClick={goToNext} aria-label={t("playlist.next")}>
        <NextIcon className="next-icon" />
      </button>
      <button
        onClick={toggleLoop}
        aria-label={t("playlist.toggleLoop")}
        aria-pressed={controls.isLoop}
        className={controls.isLoop ? "selected" : ""}
      >
        <LoopIcon selected={controls.isLoop} />
      </button>
    </div>
  );
}
