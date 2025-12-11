import { useMemo } from "react";
import Menu from "./components/menu/Menu";
import Stage from "./components/r3f/Stage";
import LoadingOverlay from "./components/menu/LoadingOverlay";
import Playlist from "./components/menu/Playlist";
import { useAppState } from "./hooks/useAppState";
import { useLanguageSelection } from "./contexts/LanguageSelectionContext";
import { useAppControls } from "./contexts/AppControlsContext";

function App() {
  const {
    // State
    isLoading,
    data,
    sceneReady,
    cameraFocusRequest,
    isMenuCollapsed,
    filteringUtils,
    selectedGroup,

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

  const { appControls, updateControl } = useAppControls();
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
        appControls={appControls}
        onDataLoaded={setData}
        onSceneReady={setSceneReady}
        onLoadingChange={setIsLoading}
        onNodesReady={setNodes}
        cameraFocusRequest={cameraFocusRequest}
        filteringUtils={filteringUtils}
        selectedLanguage={selectedLanguage}
        selectedGroup={selectedGroup}
        onLanguageClick={handleLanguageClick}
      />

      {!isLoading && sceneReady ? (
        <Menu
          appControls={appControls}
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
          selectedGroup={selectedGroup}
        />
      ) : (
        <LoadingOverlay isLoading={isLoading} />
      )}

      <Playlist
        data={data}
        sceneReady={sceneReady}
        appControls={appControls}
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
