import ControlsTab from "./ControlsTab";
import SearchTab from "./SearchTab";
import LanguagesTab from "./LanguagesTab";
import FiltersTab from "./FiltersTab";

function TabRenderer({
  activeTab,
  controls,
  onControlChange,
  languageData,
  data,
  filteringUtils,
  onFilteringUtilsChange,
  searchTerm,
  searchResults,
  languageColors,
}) {
  return (
    <div className="tabs-inner">
      {activeTab === "controls" && (
        <ControlsTab
          controlGroups={{
            state: { controls },
            handlers: {
              onControlChange,
            },
          }}
        />
      )}

      {activeTab === "languages" && (
        <LanguagesTab
          languageData={languageData}
          isActive={activeTab === "languages"}
          languageColors={languageColors}
        />
      )}

      {activeTab === "filters" && (
        <FiltersTab
          data={data}
          filteringUtils={filteringUtils}
          onFilteringUtilsChange={onFilteringUtilsChange}
          languageColors={languageColors}
        />
      )}

      {activeTab === "search" && (
        <SearchTab
          searchTerm={searchTerm}
          searchResults={searchResults}
          languageData={languageData}
          languageColors={languageColors}
        />
      )}
    </div>
  );
}

export default TabRenderer;
