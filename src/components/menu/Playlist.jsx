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
} from "./MenuIcons";
import { useI18n } from "../../contexts/I18nContext";
import "./Playlist.css";

export default function Playlist() {
  const { t } = useI18n();
  const {
    isPlaying,
    startPlaylist,
    pausePlaylist,
    goToPrev,
    goToNext,
    goToBegin,
    currentIndex,
    playlistLength,
  } = usePlaylist();

  const { controls, updateControl } = useControls();

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in input
      if (e.target.matches("input, textarea")) return;

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
      <button onClick={goToNext} aria-label={t("playlist.next")}>
        <NextIcon className="next-icon" />
      </button>
      <button
        onClick={toggleLoop}
        aria-label={t("playlist.toggleLoop")}
        aria-pressed={controls.isLoop}
        className={controls.isLoop ? "active" : ""}
      >
        <LoopIcon active={controls.isLoop} />
      </button>
      <span className="playlist-progress" aria-live="polite" aria-atomic="true">
        {playlistLength > 0
          ? t("playlist.progress", {
              current: currentIndex + 1,
              total: playlistLength,
            })
          : ""}
      </span>
    </div>
  );
}
