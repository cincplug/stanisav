import ControlsTab from "./ControlsTab";
import SearchTab from "./SearchTab";
import LanguagesTab from "./LanguagesTab";
import FiltersTab from "./FiltersTab";

function TabRenderer({
  activeTab,
  controls,
  onControlChange,
  groupedLanguages,
  languageData,
  availableGroups,
  data,
  filteringUtils,
  onFilteringUtilsChange,
  searchTerm,
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
        />
      )}

      {activeTab === "languages" && (
        <LanguagesTab
          groupedLanguages={groupedLanguages}
          languageData={languageData}
          availableGroups={availableGroups}
          isActive={activeTab === "languages"}
        />
      )}

      {activeTab === "filters" && (
        <FiltersTab
          data={data}
          filteringUtils={filteringUtils}
          onFilteringUtilsChange={onFilteringUtilsChange}
        />
      )}

      {activeTab === "search" && (
        <SearchTab
          searchTerm={searchTerm}
          searchResults={searchResults}
          languageData={languageData}
        />
      )}
    </div>
  );
}

export default TabRenderer;
