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
import "./Playlist.css";

export default function Playlist() {
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

  const isAtStart = !isPlaying && currentIndex === 0;
  let playLabel = "Resume playlist";
  let playIcon = <PlayIcon />;
  if (isAtStart) playLabel = "Play all";
  if (isPlaying) {
    playLabel = "Pause playlist";
    playIcon = <PauseIcon />;
  }

  const toggleLoop = () => updateControl("isLoop", !controls.isLoop);

  return (
    <div
      className="playlist-controls"
      role="group"
      aria-label="Playlist controls"
    >
      <button onClick={goToBegin} aria-label="Go to beginning (Home key)">
        <BeginIcon />
      </button>
      <button onClick={goToPrev} aria-label="Previous track (Left arrow)">
        <PrevIcon />
      </button>
      <button
        className="playlist-main"
        onClick={isPlaying ? pausePlaylist : startPlaylist}
        aria-label={`${playLabel} (Space or K key)`}
        aria-pressed={isPlaying}
      >
        {playIcon}
      </button>
      <button onClick={goToNext} aria-label="Next track (Right arrow)">
        <NextIcon />
      </button>
      <button
        onClick={toggleLoop}
        aria-label="Toggle loop (L key)"
        aria-pressed={controls.isLoop}
        className={controls.isLoop ? "active" : ""}
      >
        <LoopIcon active={controls.isLoop} />
      </button>
      <span className="playlist-progress" aria-live="polite" aria-atomic="true">
        {playlistLength > 0
          ? `Track ${currentIndex + 1} of ${playlistLength}`
          : "No tracks"}
      </span>
    </div>
  );
}
