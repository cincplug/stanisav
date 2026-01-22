import React, { useMemo, useState } from "react";
import {
  getFeatureValues,
  filterLanguagesByFeatures,
} from "../../utils/filteringUtils";
import {
  getAllFeatures,
  getFeatureLabel,
  getFeatureDescription, // already imported
} from "../../utils/linguisticUtils";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import "./FiltersTab.css";

function FiltersTab({ data, selectedLanguage, onLanguageFocus }) {
  const { filteringUtils, updateFilteringUtils } = useLanguageSelection();
  const features = getAllFeatures();
  const [allowMultipleChoices, setAllowMultipleChoices] = useState(false);

  const handleCheckboxChange = (feature, value, checked) => {
    let newFilters = { ...filteringUtils };

    const currentValues = newFilters[feature] || [];

    if (value === "all") {
      if (checked) {
        delete newFilters[feature];
      }
    } else {
      if (checked) {
        // If multiple choices is disabled, only allow one selection across all categories
        if (!allowMultipleChoices) {
          newFilters = { [feature]: [value] };
        } else {
          newFilters[feature] = [...currentValues, value];
        }
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
        {/* Title row with Filter by and allow multiple choices */}
        <div className="filters-tab-header">
          <h2>Filter by</h2>
          <div className="control-item checkbox-control">
            <label>
              <input
                type="checkbox"
                checked={allowMultipleChoices}
                onChange={(e) => setAllowMultipleChoices(e.target.checked)}
              />
              <span>Allow multiple choices</span>
            </label>
          </div>
        </div>

        {features.map(({ key: feature, label, isNumeric }) => {
          // For numeric features, get values from pre-computed data
          // For categorical features, get values from actual data
          const values = isNumeric
            ? data?.numericFeatureValues?.[feature] || []
            : getFeatureValues(data, feature);
          const currentValues = filteringUtils[feature] || [];
          const isAllSelected = !(feature in filteringUtils);

          return (
            <div key={feature} className="filter-group">
              <h3 className="filter-group-title">{label}</h3>
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
                  // For numeric features, use the number directly; for categorical, use label
                  const displayLabel = isNumeric
                    ? value
                    : getFeatureLabel(feature, value);
                  const valueKey = isNumeric ? value : value;
                  const isChecked = isNumeric
                    ? currentValues.map(Number).includes(Number(value))
                    : currentValues.includes(value);

                  // Get color for group/family filters
                  let buttonColor = null;
                  if (feature === "group") {
                    buttonColor = data?.groupInfo?.[value]?.color;
                  }

                  // Get description for title attribute if available
                  const description = getFeatureDescription(feature, value);

                  return (
                    <React.Fragment key={valueKey}>
                      <input
                        type="checkbox"
                        id={`${feature}-${valueKey}`}
                        checked={isChecked}
                        onChange={(e) =>
                          handleCheckboxChange(
                            feature,
                            valueKey,
                            e.target.checked,
                          )
                        }
                      />
                      <label
                        htmlFor={`${feature}-${valueKey}`}
                        className={`checkbox-button 
                          ${buttonColor ? "text-dark" : ""} 
                          ${isChecked ? "active" : ""}
                          `}
                        style={
                          buttonColor
                            ? { backgroundColor: buttonColor }
                            : undefined
                        }
                        title={description || undefined}
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
            Filter results ({linguisticResults.length})
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
                  lang.features,
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
