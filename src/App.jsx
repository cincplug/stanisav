import { useState } from "react";
import Menu from "./components/menu/Menu";
import Stage from "./components/r3f/Stage";
import LoadingOverlay from "./components/menu/Overlay";
import Playlist from "./components/menu/Playlist";
import { useAppState } from "./contexts/AppStateContext";
import { useLanguageSelection } from "./contexts/LanguageSelectionContext";
import { useControls } from "./contexts/ControlsContext";
import { usePlaylist } from "./contexts/PlaylistContext";
import "./App.css";

function App() {
  const {
    isLoading,
    data,
    sceneReady,
    isMenuCollapsed,
    filteringUtils,
    setData,
    setSceneReady,
    setIsLoading,
    setNodes,
    setIsMenuCollapsed,
    setFilteringUtils,
    handleCameraFocus,
  } = useAppState();

  const { controls, updateControl } = useControls();
  const { selectedLanguage } = useLanguageSelection();
  const { pausePlaylist } = usePlaylist();
  const [isEmptyFilter, setIsEmptyFilter] = useState(false);

  const { sampleUrl, name } = data?.languageData[selectedLanguage] || {};

  return (
    <div className={`app-container ${isLoading ? "loading" : ""}`}>
      <Stage
        isMenuCollapsed={isMenuCollapsed}
        controls={controls}
        onDataLoaded={setData}
        onSceneReady={setSceneReady}
        onLoadingChange={setIsLoading}
        onNodesReady={setNodes}
        filteringUtils={filteringUtils}
        onEmptyFilterChange={setIsEmptyFilter}
      />

      {!isLoading && sceneReady ? (
        <>
          {isEmptyFilter && <LoadingOverlay variant="emptyFilter" />}
          <Playlist />
          <Menu
            controls={controls}
            onControlChange={updateControl}
            data={data}
            isLoading={isLoading}
            sceneReady={sceneReady}
            onCameraFocus={handleCameraFocus}
            isCollapsed={isMenuCollapsed}
            onToggleCollapse={() => setIsMenuCollapsed(!isMenuCollapsed)}
            filteringUtils={filteringUtils}
            onFilteringUtilsChange={setFilteringUtils}
          />

          {sampleUrl && (
            <a
              className="button show-video"
              href={sampleUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={pausePlaylist}
              aria-label={`${name} Source Video (opens in new tab)`}
            >
              {name} Source Video ↗
            </a>
          )}
        </>
      ) : (
        <LoadingOverlay />
      )}
    </div>
  );
}

export default App;
