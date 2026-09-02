import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import IdCard from "./IdCard.jsx";
import Menu from "./menu/Menu.jsx";
import Scene from "./scene/Scene.jsx";
import { useAppStateContext } from "../contexts/AppStateContext.jsx";
import { useConfigContext } from "../contexts/ConfigContext.jsx";
import { useI18nContext } from "../contexts/I18nContext.jsx";
import { useLanguageColorsContext } from "../contexts/LanguageColorsContext.jsx";
import { useLanguageSelectionContext } from "../contexts/LanguageSelectionContext.jsx";
import { usePlaylistContext } from "../contexts/PlaylistContext.jsx";
import { useMediaQuery } from "../hooks/useMediaQuery.js";

function App() {
  const { isRtl } = useI18nContext();
  const { isLoading, data, filters, setFilters, handleCameraFocus } =
    useAppStateContext();

  const isMobile = useMediaQuery();
  const { config, updateConfigValue } = useConfigContext();
  const { selectedLanguage } = useLanguageSelectionContext();
  const { pausePlaylist } = usePlaylistContext();
  const { isIdCardVisible, isMenuExpanded, isBlackboard, labelSize } = config;
  const { sampleUrl, sub } = data?.languages[selectedLanguage] || {};

  const { languageColors } = useLanguageColorsContext();

  useEffect(() => {
    document.documentElement.style.setProperty("--label-size-scale", labelSize);
  }, [labelSize]);

  const isStanisavMini = isMobile && !!selectedLanguage && isMenuExpanded;

  return (
    <div
      className={`app-container${isRtl ? " rtl" : ""} ${isLoading ? "loading" : ""} ${isMenuExpanded ? "menu-expanded" : ""}`}
    >
      <Menu
        config={config}
        onControlChange={updateConfigValue}
        data={data}
        isLoading={isLoading}
        onCameraFocus={handleCameraFocus}
        isExpanded={isMenuExpanded}
        onToggleMenu={() =>
          updateConfigValue("global.isMenuExpanded", !isMenuExpanded)
        }
        onToggleBlackboard={() =>
          updateConfigValue("isBlackboard", !isBlackboard)
        }
        filters={filters}
        onFiltersChange={setFilters}
        languageColors={languageColors}
      />

      <div className="scene-area">
        {!isStanisavMini && <Scene />}

        {selectedLanguage && !isMobile && (
          <IdCard
            isVisible={isIdCardVisible}
            languageCode={selectedLanguage}
            language={data?.languages[selectedLanguage]}
            sampleUrl={sampleUrl}
            onSourceVideoClick={pausePlaylist}
            onToggleSubtitle={(nextValue) =>
              updateConfigValue("global.isIdCardVisible", nextValue)
            }
            sub={sub}
            languageColor={languageColors[selectedLanguage]}
          />
        )}

        {!selectedLanguage && (
          <Link className="article-link" to={`article`}>
            Who's this?
          </Link>
        )}
      </div>
    </div>
  );
}

export default App;
