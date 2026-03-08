import { useState } from "react";
import Menu from "./components/menu/Menu";
import Stage from "./components/r3f/Stage";
import Overlay from "./components/menu/Overlay";
import Playlist from "./components/menu/Playlist";
import IdCard from "./components/menu/IdCard";
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
  const { hasSubtitle } = controls;
  const { sampleUrl, sub } = data?.languageData[selectedLanguage] || {};

  return (
    <div
      className={`app-container ${isLoading ? "loading" : ""} ${isMenuCollapsed ? "menu-collapsed" : "menu-expanded"}`}
    >
      <div className="stage-area">
        <Stage
          isMenuCollapsed={isMenuCollapsed}
          onDataLoaded={setData}
          onSceneReady={setSceneReady}
          onLoadingChange={setIsLoading}
          onNodesReady={setNodes}
          onEmptyFilterChange={setIsEmptyFilter}
        />

        {(isLoading || !sceneReady) && <Overlay variant="loading" />}
        {!isLoading && sceneReady && isEmptyFilter && (
          <Overlay variant="emptyFilter" />
        )}

        {selectedLanguage && hasSubtitle && (
          <IdCard
            languageCode={selectedLanguage}
            language={data?.languageData[selectedLanguage]}
            languageLineages={data?.languageLineages}
            sampleUrl={sampleUrl}
            onSourceVideoClick={pausePlaylist}
            sub={sub}
          />
        )}
      </div>

      {!isLoading && sceneReady && (
        <>
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
        </>
      )}
    </div>
  );
}

export default App;
