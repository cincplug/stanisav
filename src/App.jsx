import { useState } from "react";
import { useParams, useLocation, Navigate } from "react-router-dom";
import PropertyShowcase from "./pages/property-showcase/PropertyShowcase.jsx";
import { CloseIcon } from "./components/menu/MenuIcons";
import { isPropertyDescribed } from "./utils/linguisticUtils";
import Menu from "./components/menu/Menu";
import Stage from "./components/r3f/Stage";
import Overlay from "./components/menu/Overlay";
import Playlist from "./components/menu/Playlist";
import IdCard from "./components/menu/IdCard";
import { useAppState } from "./contexts/AppStateContext";
import { useLanguageSelection } from "./contexts/LanguageSelectionContext";
import { useControls } from "./contexts/ControlsContext";
import { usePlaylist } from "./contexts/PlaylistContext";
import { useLanguageColors } from "./hooks/useLanguageColors";
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

  const languageColors = useLanguageColors(
    data?.languageData,
    data?.languageLineages,
    controls,
  );

  const params = useParams();
  const location = useLocation();
  const showPropertyOverlay = Boolean(params.propertyKey);

  if (showPropertyOverlay && !isPropertyDescribed(params.propertyKey)) {
    return <Navigate to={`/${params.locale || ""}`} replace />;
  }

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
          languageColors={languageColors}
        />

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
            onToggleSubtitle={(nextValue) =>
              updateControl("hasSubtitle", nextValue)
            }
            sub={sub}
            headingColor={languageColors[selectedLanguage]}
          />
        )}
        {showPropertyOverlay && (
          <div className="property-overlay">
            <button
              className={`close-button`}
              aria-label="Close property overlay"
              onClick={() => window.history.back()}
            >
              <CloseIcon />
            </button>
            <PropertyShowcase propertyKey={params.propertyKey} />
          </div>
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
            languageColors={languageColors}
          />
        </>
      )}

      {(isLoading || !sceneReady) && <Overlay variant="loading" />}
    </div>
  );
}

export default App;
