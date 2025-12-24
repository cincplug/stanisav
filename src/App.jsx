import Menu from "./components/menu/Menu";
import Stage from "./components/r3f/Stage";
import LoadingOverlay from "./components/menu/LoadingOverlay";
import Playlist from "./components/menu/Playlist";
import { useAppState } from "./hooks/useAppState";
import { useLanguageSelection } from "./contexts/LanguageSelectionContext";
import { useControls } from "./contexts/ControlsContext";

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
    handleCameraFocus
  } = useAppState();

  const { controls, updateControl } = useControls();
  const { selectedLanguage, stopCurrentAudio } = useLanguageSelection();

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
      />

      {!isLoading && sceneReady ? (
        <>
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
          <Playlist
            data={data}
            sceneReady={sceneReady}
            controls={controls}
            handleCameraFocus={handleCameraFocus}
          />

          {sampleUrl && (
            <a
              className="button show-video"
              href={sampleUrl}
              target="_blank"
              rel="noreferrer noopener"
              onClick={stopCurrentAudio}
            >
              {name} Source Video
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
