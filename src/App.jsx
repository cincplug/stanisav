import { useParams, Navigate } from "react-router-dom";
import Menu from "./components/menu/Menu";
import Stage from "./components/r3f/Stage";
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
    filteringUtils,
    setData,
    setSceneReady,
    setIsLoading,
    setNodes,
    setFilteringUtils,
    handleCameraFocus,
  } = useAppState();

  const { controls, updateControl } = useControls();
  const { selectedLanguage } = useLanguageSelection();
  const { pausePlaylist } = usePlaylist();
  const { isInfoVisible, isMenuVisible } = controls;
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
      className={`app-container${isRtl ? " rtl" : ""} ${isLoading ? "loading" : ""} ${isMenuVisible ? "menu-expanded" : "menu-collapsed"}`}
    >
      <div className="stage-area">
        <Stage
          isMenuVisible={isMenuVisible}
          onDataLoaded={setData}
          onSceneReady={setSceneReady}
          onLoadingChange={setIsLoading}
          onNodesReady={setNodes}
          languageColors={languageColors}
        />

        {selectedLanguage && isInfoVisible && (
          <IdCard
            languageCode={selectedLanguage}
            language={data?.languageData[selectedLanguage]}
            languageLineages={data?.languageLineages}
            sampleUrl={sampleUrl}
            onSourceVideoClick={pausePlaylist}
            onToggleSubtitle={(nextValue) =>
              updateControl("isInfoVisible", nextValue)
            }
            sub={sub}
            headingColor={languageColors[selectedLanguage]}
          />
        )}
      </div>

      {sceneReady && (
        <Menu
          controls={controls}
          onControlChange={updateControl}
          data={data}
          isLoading={isLoading}
          sceneReady={sceneReady}
          onCameraFocus={handleCameraFocus}
          isVisible={isMenuVisible}
          onToggleCollapse={() =>
            updateControl("isMenuVisible", !isMenuVisible)
          }
          filteringUtils={filteringUtils}
          onFilteringUtilsChange={setFilteringUtils}
          languageColors={languageColors}
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
  );
}

export default App;
