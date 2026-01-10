import React, { useMemo } from "react";
import {
  getFeatureValues,
  filterLanguagesByFeatures,
} from "../../utils/filteringUtils";
import {
  getLinguisticFeatures,
  getFeatureLabel,
} from "../../utils/linguisticUtils";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";

function FiltersTab({ data, selectedLanguage, onLanguageFocus }) {
  const { filteringUtils, updateFilteringUtils } = useLanguageSelection();
  const features = getLinguisticFeatures();

  const handleCheckboxChange = (feature, value, checked) => {
    const newFilters = { ...filteringUtils };

    const currentValues = newFilters[feature] || [];

    if (value === "all") {
      if (checked) {
        delete newFilters[feature];
      }
    } else {
      if (checked) {
        newFilters[feature] = [...currentValues, value];
      } else {
        const updatedValues = currentValues.filter((v) => v !== value);
        if (updatedValues.length === 0) {
          delete newFilters[feature];
        } else {
          newFilters[feature] = updatedValues;
        }
      }
    }

    updateFilteringUtils(newFilters, data);
  };

  const linguisticResults = useMemo(() => {
    if (Object.keys(filteringUtils).length === 0) {
      return [];
    }
    const results = filterLanguagesByFeatures(data, filteringUtils);
    return results.map((result) => ({
      ...result,
      groupName: data?.languageData?.[result.code]?.group || "Unknown",
    }));
  }, [data, filteringUtils]);

  return (
    <div className="control-section">
      <div className="linguistic-filters">
        {features.map(({ key: feature, label }) => {
          const values = getFeatureValues(data, feature);
          const currentValues = filteringUtils[feature] || [];
          const isAllSelected = !(feature in filteringUtils);

          return (
            <div key={feature} className="filter-group">
              <h4 className="filter-group-title">{label}</h4>
              <div className="checkbox-button-group">
                <input
                  type="checkbox"
                  id={`${feature}-all`}
                  checked={isAllSelected}
                  onChange={(e) =>
                    handleCheckboxChange(feature, "all", e.target.checked)
                  }
                />
                <label
                  htmlFor={`${feature}-all`}
                  className={`checkbox-button ${isAllSelected ? "active" : ""}`}
                >
                  All
                </label>
                {values.map((value) => {
                  const displayLabel = getFeatureLabel(feature, value);
                  return (
                    <React.Fragment key={value}>
                      <input
                        type="checkbox"
                        id={`${feature}-${value}`}
                        checked={currentValues.includes(value)}
                        onChange={(e) =>
                          handleCheckboxChange(feature, value, e.target.checked)
                        }
                      />
                      <label
                        htmlFor={`${feature}-${value}`}
                        className={`checkbox-button ${
                          currentValues.includes(value) ? "active" : ""
                        }`}
                      >
                        {displayLabel}
                      </label>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {linguisticResults && linguisticResults.length > 0 && (
        <fieldset className="results-fieldset">
          <legend className="results-legend">
            Filter Results ({linguisticResults.length})
          </legend>
          <div className="language-grid">
            {linguisticResults.map((lang) => (
              <button
                key={lang.code}
                className={`language-button-grid ${
                  selectedLanguage === lang.code ? "selected" : ""
                }`}
                onClick={() => onLanguageFocus(lang.code)}
                title={`${lang.name} (${lang.groupName}) - ${Object.entries(
                  lang.features
                )
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ")}`}
              >
                <div className="language-name">{lang.name}</div>
                <small className="language-group">{lang.groupName}</small>
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}

export default FiltersTab;
