import { useEffect } from "react";
import Menu from "./components/menu/Menu";
import Stage from "./components/r3f/Stage";
import IdCard from "./components/menu/IdCard";
import Flowers from "./components/menu/Flowers";
import { useAppState } from "./contexts/AppStateContext";
import { useLanguageSelection } from "./contexts/LanguageSelectionContext";
import { useControls } from "./contexts/ControlsContext";
import { usePlaylist } from "./contexts/PlaylistContext";
import { useLanguageColors } from "./hooks/useLanguageColors";
import { useI18n } from "./contexts/I18nContext";
import { useMediaQuery } from "./hooks/useMediaQuery.js";
import "./App.css";

function App() {
  const { isRtl } = useI18n();
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
  const { selectedLanguage } = useLanguageSelection();
  const { pausePlaylist } = usePlaylist();
  const { isIdCardVisible, isMenuExpanded, isSegmented, labelSize } = controls;
  const { sampleUrl, sub } = data?.languageData[selectedLanguage] || {};

  const languageColors = useLanguageColors(
    data?.languageData,
    data?.languageLineages,
    controls,
  );

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--label-size-scale",
      controls.labelSize / 1.5,
    );
  }, [controls.labelSize]);

  const isMeshaMini = isMobile && !!selectedLanguage && isMenuExpanded;

  return (
    <div
      className={`app-container${isRtl ? " rtl" : ""} ${isLoading ? "loading" : ""} ${isMenuExpanded ? "menu-expanded" : ""}`}
    >
      <Menu
        controls={controls}
        onControlChange={updateControl}
        data={data}
        isLoading={isLoading}
        sceneReady={sceneReady}
        onCameraFocus={handleCameraFocus}
        isExpanded={isMenuExpanded}
        onToggleMenu={() => updateControl("isMenuExpanded", !isMenuExpanded)}
        onToggleSegmentation={() => updateControl("isSegmented", !isSegmented)}
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

        {selectedLanguage && !isMobile && (
          <IdCard
            isVisible={isIdCardVisible}
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

        {/* <Flowers /> */}
      </div>
    </div>
  );
}

export default App;
