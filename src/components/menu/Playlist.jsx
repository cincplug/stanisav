import { usePlaylist } from "../../contexts/PlaylistContext";
import { useControls } from "../../contexts/ControlsContext";
import {
  PlayIcon,
  PauseIcon,
  BeginIcon,
  PrevIcon,
  NextIcon,
  LoopIcon
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
    playlistLength
  } = usePlaylist();

  const { controls, updateControl } = useControls();

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
    <div className="playlist-controls">
      <button onClick={goToBegin} title="Go to beginning">
        <BeginIcon />
      </button>
      <button onClick={goToPrev} title="Previous">
        <PrevIcon />
      </button>
      <button
        className="playlist-main"
        onClick={isPlaying ? pausePlaylist : startPlaylist}
        title={playLabel}
      >
        {playIcon}
      </button>
      <button onClick={goToNext} title="Next">
        <NextIcon />
      </button>
      <button
        onClick={toggleLoop}
        title="Toggle loop"
        className={controls.isLoop ? "active" : ""}
      >
        <LoopIcon active={controls.isLoop} />
      </button>
      <span className="playlist-progress">
        {playlistLength > 0
          ? `${currentIndex + 1} / ${playlistLength}`
          : "0 / 0"}
      </span>
    </div>
  );
}
