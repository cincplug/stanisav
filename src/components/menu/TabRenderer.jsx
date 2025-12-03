import React from "react";
import ControlsTab from "./ControlsTab";
import SearchTab from "./SearchTab";
import LanguagesTab from "./LanguagesTab";
import FiltersTab from "./FiltersTab";

function TabRenderer({
  activeTab,
  sceneControls,
  onSceneControlChange,
  colorsControls,
  onColorsControlChange,
  cameraControls,
  onCameraControlChange,
  handleViewAll,
  groupedLanguages,
  selectedLanguage,
  selectedGroup,
  handleGroupFocus,
  handleLanguageFocus,
  languageData,
  availableGroups,
  handleGroupSelectChange,
  data,
  filteringUtils,
  onfilteringUtilsChange,
  searchTerm,
  setSearchTerm,
  searchResults,
  clearSearch
}) {
  return (
    <div className="tabs-inner">
      {activeTab === "controls" && (
        <ControlsTab
          controlGroups={{
            state: {
              Scene: sceneControls,
              Colors: colorsControls,
              Camera: cameraControls
            },
            handlers: {
              Scene: onSceneControlChange,
              Colors: onColorsControlChange,
              Camera: onCameraControlChange
            }
          }}
          onViewAll={handleViewAll}
        />
      )}

      {activeTab === "languages" && (
        <LanguagesTab
          groupedLanguages={groupedLanguages}
          selectedLanguage={selectedLanguage}
          selectedGroup={selectedGroup}
          onGroupFocus={handleGroupFocus}
          onLanguageFocus={handleLanguageFocus}
          languageData={languageData}
          availableGroups={availableGroups}
          onGroupSelectChange={handleGroupSelectChange}
          isActive={activeTab === "languages"}
        />
      )}

      {activeTab === "filters" && (
        <FiltersTab
          data={data}
          filteringUtils={filteringUtils}
          onfilteringUtilsChange={onfilteringUtilsChange}
          selectedLanguage={selectedLanguage}
          onLanguageFocus={handleLanguageFocus}
        />
      )}

      {activeTab === "search" && (
        <SearchTab
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchResults={searchResults}
          clearSearch={clearSearch}
          selectedLanguage={selectedLanguage}
          onLanguageFocus={handleLanguageFocus}
        />
      )}
    </div>
  );
}

export default TabRenderer;
