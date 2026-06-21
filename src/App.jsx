import { useEffect } from "react";
import "./App.css";
import IdCard from "./components/menu/IdCard";
import Menu from "./components/menu/Menu";
import Stage from "./components/r3f/Stage";
import { useAppStateContext } from "./contexts/AppStateContext";
import { useConfigContext } from "./contexts/ConfigContext.jsx";
import { useI18nContext } from "./contexts/I18nContext";
import { useLanguageColorsContext } from "./contexts/LanguageColorsContext.jsx";
import { useLanguageSelectionContext } from "./contexts/LanguageSelectionContext";
import { usePlaylistContext } from "./contexts/PlaylistContext";
import { useMediaQuery } from "./hooks/useMediaQuery.js";

function App() {
  const { isRtl } = useI18nContext();
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
  } = useAppStateContext();

  const isMobile = useMediaQuery();
  const { config, updateConfigValue } = useConfigContext();
  const { selectedLanguage } = useLanguageSelectionContext();
  const { pausePlaylist } = usePlaylistContext();
  const { isIdCardVisible, isMenuExpanded } = config.global;
  const { isSegmented, labelSize } = config.header;
  const { sampleUrl, sub } = data?.languageData[selectedLanguage] || {};

  const { languageColors } = useLanguageColorsContext();

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--label-size-scale",
      labelSize / 1.5,
    );
  }, [labelSize]);

  const isMeshaMini = isMobile && !!selectedLanguage && isMenuExpanded;

  return (
    <div
      className={`app-container${isRtl ? " rtl" : ""} ${isLoading ? "loading" : ""} ${isMenuExpanded ? "menu-expanded" : ""}`}
    >
      <Menu
        config={config}
        onControlChange={updateConfigValue}
        data={data}
        isLoading={isLoading}
        isSceneReady={isSceneReady}
        onCameraFocus={handleCameraFocus}
        isExpanded={isMenuExpanded}
        onToggleMenu={() =>
          updateConfigValue("global.isMenuExpanded", !isMenuExpanded)
        }
        onToggleSegmentation={() =>
          updateConfigValue("isSegmented", !isSegmented)
        }
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
              updateConfigValue("global.isIdCardVisible", nextValue)
            }
            sub={sub}
            languageColor={languageColors[selectedLanguage]}
          />
        )}
      </div>
    </div>
  );
}

export default App;
