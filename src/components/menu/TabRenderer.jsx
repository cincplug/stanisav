import { useSearch } from "../../hooks/useSearch";
import ControlsTab from "./ControlsTab";
import FiltersTab from "./FiltersTab";
import LanguagesTab from "./LanguagesTab";
import SearchTab from "./SearchTab";

function TabRenderer({
  selectedTab,
  languages,
  lineages,
  data,
  filters,
  onFiltersChange,
  languageColors,
}) {
  const { searchTerm, setSearchTerm, searchResults, clearSearch } =
    useSearch(data);

  const panelProps = (id) => ({
    id: `tabpanel-${id}`,
    role: "tabpanel",
    "aria-labelledby": `tab-${id}`,
  });

  return (
    <div className="tabs-inner">
      {selectedTab === "controls" && (
        <div {...panelProps("controls")}>
          <ControlsTab />
        </div>
      )}

      {selectedTab === "languages" && (
        <div {...panelProps("languages")}>
          <LanguagesTab
            languages={languages}
            lineages={lineages}
            isSelected={selectedTab === "languages"}
            languageColors={languageColors}
          />
        </div>
      )}

      {selectedTab === "filters" && (
        <div {...panelProps("filters")}>
          <FiltersTab
            data={data}
            filters={filters}
            onFiltersChange={onFiltersChange}
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
            languages={languages}
            languageColors={languageColors}
          />
        </div>
      )}
    </div>
  );
}

export default TabRenderer;
