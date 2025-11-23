import { useState, useMemo } from "react";
import Menu from "./components/menu/Menu";
import Stage from "./components/r3f/Stage";
import LoadingOverlay from "./components/menu/LoadingOverlay";
import InfoPanel from "./components/info/InfoPanel";
import { useAppState } from "./hooks/useAppState";
import VideoEmbed from "./components/menu/VideoEmbed";

function App() {
  const {
    // State
    isLoading,
    data,
    sceneReady,
    cameraFocusRequest,
    isMenuCollapsed,
    filteringUtils,
    selectedLanguage,
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

  const [showVideo, setShowVideo] = useState(true);
  const { hasVideoPreview } = sceneControls;

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

      {hasVideoPreview && sampleUrl && showVideo && (
        <VideoEmbed url={sampleUrl} onClose={() => setShowVideo(false)} />
      )}
    </div>
  );
}

export default App;
