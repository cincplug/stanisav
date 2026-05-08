import { useMemo } from "react";
import Menu from "./components/menu/Menu";
import MiniMesha from "./components/r3f/MiniMesha.jsx";
import Stage from "./components/r3f/Stage";
import IdCard from "./components/menu/IdCard";
import { useAppState } from "./contexts/AppStateContext";
import { useLanguageSelection } from "./contexts/LanguageSelectionContext";
import { useControls } from "./contexts/ControlsContext";
import { usePlaylist } from "./contexts/PlaylistContext";
import { useI18n } from "./contexts/I18nContext";
import { useLanguageColors } from "./hooks/useLanguageColors";
import { useMediaQuery } from "./hooks/useMediaQuery.js";
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

  const isMobile = useMediaQuery();

  const { controls, updateControl } = useControls();
  const { selectedLanguage, selectedProperty, setSelectedProperty } =
    useLanguageSelection();
  const { pausePlaylist } = usePlaylist();
  const { isIdCardVisible, isMenuVisible, isMenuExpanded } = controls;
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

  const isMeshaMini = useMemo(
    () => isMobile && selectedLanguage && isMenuVisible && isMenuExpanded,
    [isMobile, selectedLanguage, isMenuVisible, isMenuExpanded],
  );

  const selectedLinguisticProperties = data?.languageData[selectedLanguage];
  const selectedColor = languageColors[selectedLanguage];

  return (
    <div
      className={`app-container${isRtl ? " rtl" : ""} ${isLoading ? "loading" : ""} ${isMenuVisible && isMenuExpanded ? "menu-expanded" : ""}`}
    >
      <Menu
        controls={controls}
        onControlChange={updateControl}
        data={data}
        isLoading={isLoading}
        sceneReady={sceneReady}
        onCameraFocus={handleCameraFocus}
        isVisible={isMenuVisible}
        onToggleCollapse={() => updateControl("isMenuVisible", !isMenuVisible)}
        filteringUtils={filteringUtils}
        onFilteringUtilsChange={setFilteringUtils}
        languageColors={languageColors}
      />

      <div className="stage-area">
        {!isMeshaMini && (
          <Stage
            onDataLoaded={setData}
            onSceneReady={setSceneReady}
            onLoadingChange={setIsLoading}
            onNodesReady={setNodes}
            languageColors={languageColors}
          />
        )}

        {selectedLanguage && isIdCardVisible && !isMobile && (
          <IdCard
            languageCode={selectedLanguage}
            language={data?.languageData[selectedLanguage]}
            languageLineages={data?.languageLineages}
            sampleUrl={sampleUrl}
            onSourceVideoClick={pausePlaylist}
            onToggleSubtitle={(nextValue) =>
              updateControl("isIdCardVisible", nextValue)
            }
            sub={sub}
            languageColor={languageColors[selectedLanguage]}
          />
        )}
      </div>

      {isMeshaMini && (
        <MiniMesha
          languageCode={selectedLanguage}
          linguisticProperties={selectedLinguisticProperties}
          color={selectedColor}
        />
      )}
    </div>
  );
}

export default App;
