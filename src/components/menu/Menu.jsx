import { useState } from "react";
import { useAppControls } from "../../contexts/AppControlsContext";
import { useLanguageSearch } from "../../hooks/useLanguageSearch";
import { useMenuHandlers } from "../../hooks/useMenuHandlers";
import { useTabHandlers } from "../../hooks/useTabHandlers";
import { BurgerIcon, CloseIcon } from "./MenuIcons";
import tabsConfig from "../../config/tabsConfig.json";
import TabNavigation from "./TabNavigation";
import TabRenderer from "./TabRenderer";
import "./Menu.css";

function Menu({
  sceneControls,
  onSceneControlChange,
  colorsControls,
  onColorsControlChange,
  cameraControls,
  onCameraControlChange,
  data,
  isLoading,
  sceneReady,
  onCameraFocus,
  isCollapsed,
  onToggleCollapse,
  filteringUtils,
  onfilteringUtilsChange,
  selectedLanguage,
  selectedGroup
}) {
  const { controls, updateControl } = useAppControls();
  const [activeTab, setActiveTab] = useState(tabsConfig.defaultTab);

  const { searchTerm, setSearchTerm, searchResults, clearSearch } =
    useLanguageSearch(data);

  const { handleLanguageFocus, handleGroupFocus, handleViewAll } =
    useMenuHandlers(onCameraFocus, sceneReady, data, sceneControls);

  const { availableGroups, groupedLanguages, handleGroupSelectChange } =
    useTabHandlers(data, handleGroupFocus, handleViewAll);

  if (isLoading) {
    return null;
  }

  // Create a combined handler that updates both local state and context
  const handleControlChange = (group, controlId, value) => {
    // Update local state through existing handlers
    switch (group) {
      case "Scene":
        onSceneControlChange(controlId, value);
        break;
      case "Colors":
        onColorsControlChange(controlId, value);
        break;
      case "Camera":
        onCameraControlChange(controlId, value);
        break;
    }

    // Update context
    updateControl(group, {
      ...controls[group],
      [controlId]: value
    });
  };

  return (
    <>
      {/* Toggle button - always visible */}
      <button
        id="menu-toggle"
        onClick={() => onToggleCollapse(!isCollapsed)}
        className="close-button"
        aria-label={isCollapsed ? "Open menu" : "Close menu"}
      >
        {isCollapsed ? <BurgerIcon /> : <CloseIcon />}
      </button>

      {/* Menu panel - hidden when collapsed */}
      {!isCollapsed && (
        <div className="menu">
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <TabRenderer
            activeTab={activeTab}
            sceneControls={sceneControls}
            onSceneControlChange={(id, value) =>
              handleControlChange("Scene", id, value)
            }
            colorsControls={colorsControls}
            onColorsControlChange={(id, value) =>
              handleControlChange("Colors", id, value)
            }
            cameraControls={cameraControls}
            onCameraControlChange={(id, value) =>
              handleControlChange("Camera", id, value)
            }
            handleViewAll={handleViewAll}
            groupedLanguages={groupedLanguages}
            selectedLanguage={selectedLanguage}
            selectedGroup={selectedGroup}
            handleGroupFocus={handleGroupFocus}
            handleLanguageFocus={handleLanguageFocus}
            languageData={data?.languages || {}}
            availableGroups={availableGroups}
            handleGroupSelectChange={handleGroupSelectChange}
            data={data}
            filteringUtils={filteringUtils}
            onfilteringUtilsChange={onfilteringUtilsChange}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchResults={searchResults}
            clearSearch={clearSearch}
          />
        </div>
      )}
    </>
  );
}

export default Menu;
