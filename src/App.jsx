import { useMemo } from "react";
import Menu from "./components/menu/Menu";
import Stage from "./components/r3f/Stage";
import LoadingOverlay from "./components/menu/LoadingOverlay";
import Playlist from "./components/menu/Playlist";
import { useAppState } from "./hooks/useAppState";
import { useLanguageSelection } from "./contexts/LanguageSelectionContext";
import { useControls } from "./contexts/ControlsContext";

function App() {
  const {
    // State
    isLoading,
    data,
    sceneReady,
    cameraFocusRequest,
    isMenuCollapsed,
    filteringUtils,

    // Setters
    setData,
    setSceneReady,
    setIsLoading,
    setNodes,
    setIsMenuCollapsed,
    setFilteringUtils,

    // Handlers
    handleCameraFocus,
    handleLanguageClick
  } = useAppState();

  const { controls, updateControl } = useControls();
  const { selectedLanguage, stopCurrentAudio } = useLanguageSelection();

  const { sampleUrl, videoName } = useMemo(() => {
    if (!data?.languageData || !selectedLanguage) {
      return { sampleUrl: null, videoName: null };
    }

    const languageData = data.languageData[selectedLanguage];
    return {
      sampleUrl: languageData?.sampleUrl || null,
      videoName: languageData?.name || null
    };
  }, [data, selectedLanguage]);

  return (
    <div className={`app-container ${isLoading ? "loading" : ""}`}>
      <Stage
        isMenuCollapsed={isMenuCollapsed}
        controls={controls}
        onDataLoaded={setData}
        onSceneReady={setSceneReady}
        onLoadingChange={setIsLoading}
        onNodesReady={setNodes}
        cameraFocusRequest={cameraFocusRequest}
        filteringUtils={filteringUtils}
        selectedLanguage={selectedLanguage}
        onLanguageClick={handleLanguageClick}
      />

      {!isLoading && sceneReady ? (
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
          onfilteringUtilsChange={setFilteringUtils}
          selectedLanguage={selectedLanguage}
        />
      ) : (
        <LoadingOverlay isLoading={isLoading} />
      )}

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
          {videoName} Source Video
        </a>
      )}
    </div>
  );
}

export default App;
