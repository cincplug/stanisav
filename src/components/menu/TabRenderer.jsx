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
  const panelProps = (id) => ({
    id: `tabpanel-${id}`,
    role: "tabpanel",
    "aria-labelledby": `tab-${id}`,
    tabIndex: 0,
  });

  return (
    <div className="tabs-inner">
      {selectedTab === "controls" && (
        <div {...panelProps("controls")}>
          <ControlsTab
            controlGroups={{
              state: { controls },
              handlers: {
                onControlChange,
              },
            }}
          />
        </div>
      )}

      {selectedTab === "languages" && (
        <div {...panelProps("languages")}>
          <LanguagesTab
            languageData={languageData}
            isSelected={selectedTab === "languages"}
            languageColors={languageColors}
          />
        </div>
      )}

      {selectedTab === "filters" && (
        <div {...panelProps("filters")}>
          <FiltersTab
            data={data}
            filteringUtils={filteringUtils}
            onFilteringUtilsChange={onFilteringUtilsChange}
            languageColors={languageColors}
          />
        </div>
      )}

      {selectedTab === "search" && (
        <div {...panelProps("search")}>
          <SearchTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            clearSearch={clearSearch}
            searchResults={searchResults}
            languageData={languageData}
            languageColors={languageColors}
          />
        </div>
      )}
    </div>
  );
}

export default TabRenderer;
