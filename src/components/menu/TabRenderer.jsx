import ControlsTab from "./ControlsTab";
import SearchTab from "./SearchTab";
import LanguagesTab from "./LanguagesTab";
import FiltersTab from "./FiltersTab";

function TabRenderer({
  selectedTab,
  controls,
  onControlChange,
  languageData,
  data,
  filteringUtils,
  onFilteringUtilsChange,
  searchTerm,
  setSearchTerm,
  searchResults,
  clearSearch,
  languageColors,
}) {
  return (
    <div className="tabs-inner">
      {selectedTab === "controls" && (
        <ControlsTab
          controlGroups={{
            state: { controls },
            handlers: {
              onControlChange,
            },
          }}
        />
      )}

      {selectedTab === "languages" && (
        <LanguagesTab
          languageData={languageData}
          isSelected={selectedTab === "languages"}
          languageColors={languageColors}
        />
      )}

      {selectedTab === "filters" && (
        <FiltersTab
          data={data}
          filteringUtils={filteringUtils}
          onFilteringUtilsChange={onFilteringUtilsChange}
          languageColors={languageColors}
        />
      )}

      {selectedTab === "search" && (
        <SearchTab
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          clearSearch={clearSearch}
          searchResults={searchResults}
          languageData={languageData}
          languageColors={languageColors}
        />
      )}
    </div>
  );
}

export default TabRenderer;
