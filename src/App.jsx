import { useParams, Navigate } from "react-router-dom";
import Menu from "./components/menu/Menu";
import Stage from "./components/r3f/Stage";
import Overlay from "./components/menu/Overlay";
import PropertyShowcase from "./pages/property-showcase/PropertyShowcase.jsx";
import IdCard from "./components/menu/IdCard";
import { CloseIcon } from "./components/menu/MenuIcons";
import { useAppState } from "./contexts/AppStateContext";
import { useLanguageSelection } from "./contexts/LanguageSelectionContext";
import { useControls } from "./contexts/ControlsContext";
import { usePlaylist } from "./contexts/PlaylistContext";
import { useLanguageColors } from "./hooks/useLanguageColors";
import { isPropertyDescribed } from "./utils/linguisticUtils";
import { useI18n } from "./contexts/I18nContext";
import "./App.css";

function App() {
  const { t, isRtl } = useI18n();
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
  const { hasSubtitle } = controls;
  const { sampleUrl, sub } = data?.languageData[selectedLanguage] || {};

  const languageColors = useLanguageColors(
    data?.languageData,
    data?.languageLineages,
    controls,
  );

  const params = useParams();
  const showPropertyOverlay = Boolean(params.propertyKey);

  if (showPropertyOverlay && !isPropertyDescribed(params.propertyKey)) {
    return <Navigate to={`/${params.locale || ""}`} replace />;
  }

  return (
    <div
      className={`app-container${isRtl ? " rtl" : ""} ${isLoading ? "loading" : ""} ${isMenuCollapsed ? "menu-collapsed" : "menu-expanded"}`}
    >
      <div className="stage-area">
        <Stage
          isMenuCollapsed={isMenuCollapsed}
          onDataLoaded={setData}
          onSceneReady={setSceneReady}
          onLoadingChange={setIsLoading}
          onNodesReady={setNodes}
          languageColors={languageColors}
        />

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
          <>
            <PropertyShowcase propertyKey={params.propertyKey} />
            <button
              className={`close-button${isRtl ? " close-button-rtl" : ""}`}
              aria-label={t("menu.close")}
              onClick={() => window.history.back()}
            >
              <CloseIcon />
            </button>
          </>
        )}
      </div>

      {!isLoading && sceneReady && (
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
      )}

      {(isLoading || !sceneReady) && <Overlay variant="loading" />}
    </div>
  );
}

export default App;
