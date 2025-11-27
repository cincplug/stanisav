import { useMemo } from "react";
import Menu from "./components/menu/Menu";
import Stage from "./components/r3f/Stage";
import LoadingOverlay from "./components/menu/LoadingOverlay";
import InfoPanel from "./components/info/InfoPanel";
import Playlist from "./components/menu/Playlist";
import { useAppState } from "./hooks/useAppState";
import { useLanguageSelection } from "./contexts/LanguageSelectionContext";

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
    sceneControls,
    colorsControls,
    cameraControls,
    isInfoPanelClosed,

    // Setters
    setData,
    setSceneReady,
    setIsLoading,
    setNodes,
    setIsMenuCollapsed,
    setFilteringUtils,
    setIsInfoPanelClosed,

    // Handlers
    updateSceneControl,
    updateColorsControl,
    updateCameraControl,
    handleCameraFocus,
    handleLanguageClick
  } = useAppState();

  const { selectedLanguage, stopCurrentAudio } = useLanguageSelection();

  const sampleUrl = useMemo(() => {
    if (!data?.languageData || !selectedLanguage) return null;
    return data.languageData[selectedLanguage]?.sampleUrl || null;
  }, [data, selectedLanguage]);

  return (
    <div className={`app-container ${isLoading ? "loading" : ""}`}>
      <Stage
        isMenuCollapsed={isMenuCollapsed}
        sceneControls={sceneControls}
        colorsControls={colorsControls}
        cameraControls={cameraControls}
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
      {/* Language Info Panel */}
      {!isLoading && sceneReady && (
        <InfoPanel
          selectedLanguage={selectedLanguage}
          isVisible={sceneControls.showInfo && !isInfoPanelClosed}
          onClose={() => setIsInfoPanelClosed(true)}
          showInfo={sceneControls.showInfo}
          onToggleShowInfo={(value) => updateSceneControl("showInfo", value)}
          sceneControls={sceneControls}
          onCameraFocus={handleCameraFocus}
          data={data}
        />
      )}
      {/* React-based Control Panel */}
      {!isLoading && sceneReady ? (
        <Menu
          sceneControls={sceneControls}
          onSceneControlChange={updateSceneControl}
          colorsControls={colorsControls}
          onColorsControlChange={updateColorsControl}
          cameraControls={cameraControls}
          onCameraControlChange={updateCameraControl}
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
        sceneControls={sceneControls}
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
          Source video
        </a>
      )}
    </div>
  );
}

export default App;
