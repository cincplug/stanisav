import "./Playlist.css";
import { usePlaylist } from "../../hooks/usePlaylist";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import {
  PlayIcon,
  PauseIcon,
  BeginIcon,
  PrevIcon,
  NextIcon
} from "./MenuIcons";

export default function Playlist({
  data,
  sceneReady,
  sceneControls,
  handleCameraFocus
}) {
  const { selectedLanguage } = useLanguageSelection();
  const {
    isPlaying,
    startPlaylist,
    pausePlaylist,
    goToPrev,
    goToNext,
    goToBegin,
    currentIndex,
    playlistLength
  } = usePlaylist({
    data,
    sceneReady,
    sceneControls,
    handleCameraFocus,
    selectedLanguage
  });

  const atBegin = currentIndex === 0;
  const atEnd = currentIndex >= playlistLength - 1;
  const isAtStart = !isPlaying && currentIndex === 0;

  let playLabel = "Resume playlist";
  let playIcon = <PlayIcon />;
  if (isAtStart) playLabel = "Play all";
  if (isPlaying) {
    playLabel = "Pause playlist";
    playIcon = <PauseIcon />;
  }

  return (
    <div className="playlist-controls">
      <button
        className="playlist-main"
        onClick={isPlaying ? pausePlaylist : startPlaylist}
        title={playLabel}
      >
        {playIcon}
      </button>

      <button onClick={goToBegin} disabled={atBegin} title="Go to beginning">
        <BeginIcon />
      </button>
      <button onClick={goToPrev} disabled={atBegin} title="Previous">
        <PrevIcon />
      </button>
      <button onClick={goToNext} disabled={atEnd} title="Next">
        <NextIcon />
      </button>
      <span className="playlist-progress">
        {playlistLength > 0
          ? `${currentIndex + 1} / ${playlistLength}`
          : "0 / 0"}
      </span>
    </div>
  );
}
