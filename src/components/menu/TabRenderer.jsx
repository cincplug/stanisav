import ControlsTab from "./ControlsTab";
import SearchTab from "./SearchTab";
import LanguagesTab from "./LanguagesTab";
import FiltersTab from "./FiltersTab";

function TabRenderer({
  activeTab,
  controls,
  onControlChange,
  handleViewAll,
  groupedLanguages,
  selectedLanguage,
  handleLanguageFocus,
  languageData,
  availableGroups,
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
            state: { controls },
            handlers: {
              onControlChange
            }
          }}
          onViewAll={handleViewAll}
        />
      )}

      {activeTab === "languages" && (
        <LanguagesTab
          groupedLanguages={groupedLanguages}
          selectedLanguage={selectedLanguage}
          onLanguageFocus={handleLanguageFocus}
          languageData={languageData}
          availableGroups={availableGroups}
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
