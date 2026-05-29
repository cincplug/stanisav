import { useEffect } from "react";
import "./App.css";
import Flowers from "./components/menu/Flowers";
import IdCard from "./components/menu/IdCard";
import Menu from "./components/menu/Menu";
import Stage from "./components/r3f/Stage";
import { useAppState } from "./contexts/AppStateContext";
import { useControls } from "./contexts/ControlsContext";
import { useI18n } from "./contexts/I18nContext";
import { useLanguageSelection } from "./contexts/LanguageSelectionContext";
import { usePlaylist } from "./contexts/PlaylistContext";
import { useLanguageColors } from "./hooks/useLanguageColors";
import { useMediaQuery } from "./hooks/useMediaQuery.js";

function App() {
  const { isRtl } = useI18n();
  const {
    isLoading,
    data,
    isSceneReady,
    filters,
    setData,
    setIsLoading,
    setNodes,
    setFilters,
    handleCameraFocus,
  } = useAppState();

  const isMobile = useMediaQuery();
  const { controls, updateControl } = useControls();
  const { selectedLanguage } = useLanguageSelection();
  const { pausePlaylist } = usePlaylist();
  const { isIdCardVisible, isMenuExpanded, isSegmented } = controls;
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
        isSceneReady={isSceneReady}
        onCameraFocus={handleCameraFocus}
        isExpanded={isMenuExpanded}
        onToggleMenu={() => updateControl("isMenuExpanded", !isMenuExpanded)}
        onToggleSegmentation={() => updateControl("isSegmented", !isSegmented)}
        filters={filters}
        onFiltersChange={setFilters}
        languageColors={languageColors}
      />

      <div className="stage-area">
        {!isMeshaMini && (
          <Stage
            onDataLoaded={setData}
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

        {!isMobile && <Flowers selectedLanguage={selectedLanguage} />}
      </div>
    </div>
  );
}

export default App;
