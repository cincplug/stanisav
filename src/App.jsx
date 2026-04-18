import Menu from "./components/menu/Menu";
import Stage from "./components/r3f/Stage";
import Properties from "./components/Properties.jsx";
import IdCard from "./components/menu/IdCard";
import { useAppState } from "./contexts/AppStateContext";
import { useLanguageSelection } from "./contexts/LanguageSelectionContext";
import { useControls } from "./contexts/ControlsContext";
import { usePlaylist } from "./contexts/PlaylistContext";
import { useLanguageColors } from "./hooks/useLanguageColors";
import { useI18n } from "./contexts/I18nContext";
import { getLanguagePropertyValue } from "./utils/linguisticUtils.js";
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
  const { selectedLanguage, selectedProperty, setSelectedProperty } =
    useLanguageSelection();
  const { pausePlaylist } = usePlaylist();
  const { isInfoVisible, isMenuVisible, isMenuExpanded } = controls;
  const { sampleUrl, sub } = data?.languageData[selectedLanguage] || {};

  const languageColors = useLanguageColors(
    data?.languageData,
    data?.languageLineages,
    controls,
  );

  const selectedLanguageValue = getLanguagePropertyValue(
    data?.languageData,
    selectedLanguage,
    selectedProperty,
  );

  return (
    <div
      className={`app-container${isRtl ? " rtl" : ""} ${isLoading ? "loading" : ""} ${isMenuVisible && isMenuExpanded ? "menu-expanded" : ""}`}
    >
      <div className="stage-area">
        <Stage
          onDataLoaded={setData}
          onSceneReady={setSceneReady}
          onLoadingChange={setIsLoading}
          onNodesReady={setNodes}
          languageColors={languageColors}
        />

        {selectedLanguage && isInfoVisible && isMenuExpanded && (
          <>
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
              languageColor={languageColors[selectedLanguage]}
            />
            {selectedProperty && (
              <Properties
                propertyKey={selectedProperty}
                selectedLanguageValue={selectedLanguageValue}
              />
            )}
          </>
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
    </div>
  );
}

export default App;
