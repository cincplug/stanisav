import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  getFeatureValues,
  filterLanguagesByFeatures,
} from "../../utils/filteringUtils";
import {
  getAllFeatures,
  getFeatureName,
  getFeatureLabel,
  getFeatureDescription,
  isPropertyDescribed,
} from "../../utils/linguisticUtils";
import { sortFeatureValues } from "../../utils/sortingUtils";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { usePlaylist } from "../../contexts/PlaylistContext";
import { useI18n } from "../../contexts/I18nContext";
import { Link } from "react-router-dom";
import "./FiltersTab.css";

function FiltersTab({ data, languageColors = {} }) {
  const { viewAllLanguages } = useLanguageSelection();
  const { pausePlaylist } = usePlaylist();
  const { filteringUtils, updateFilteringUtils, selectedLanguage } =
    useLanguageSelection();
  const { startFromLanguage } = usePlaylist();

  const handleSelectLanguage = (langCode) => {
    startFromLanguage(langCode);
  };
  const features = getAllFeatures();
  const validFeatureKeys = useMemo(
    () => new Set(features.map((feature) => feature.key)),
    [features],
  );
  const [allowMultipleChoices, setAllowMultipleChoices] = useState(false);
  const [lastChangedFeature, setLastChangedFeature] = useState(null);
  const resultsRefs = useRef({});
  const emptyRefs = useRef({});
  const { t, locale } = useI18n();

  const handleCheckboxChange = (feature, value, checked) => {
    setLastChangedFeature(feature);

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
    }));
  }, [data, filteringUtils]);

  const handleViewAll = () => {
    pausePlaylist();
    viewAllLanguages();
  };

  const hasActiveFilters = Object.keys(filteringUtils).length > 0;
  const hasEmptyResult = hasActiveFilters && linguisticResults.length === 0;

  useEffect(() => {
    if (!lastChangedFeature) return;

    if (linguisticResults.length > 0) {
      const resultsEl = resultsRefs.current[lastChangedFeature];
      if (!resultsEl) return;
      requestAnimationFrame(() => {
        resultsEl.scrollIntoView({ behavior: "smooth", block: "center" });
        resultsEl.focus();
      });
      return;
    }

    if (hasEmptyResult) {
      const emptyEl = emptyRefs.current[lastChangedFeature];
      if (!emptyEl) return;
      requestAnimationFrame(() => {
        emptyEl.scrollIntoView({ behavior: "smooth", block: "center" });
        emptyEl.focus();
      });
    }
  }, [lastChangedFeature, linguisticResults.length, hasEmptyResult]);

  return (
    <div className="control-section">
      <div className="linguistic-filters">
        {/* Title row with Filter by and allow multiple choices */}
        <div className="filters-tab-header">
          <button onClick={handleViewAll} className="view-all-button">
            {t("search.viewAll")}
          </button>
          <div className="control-item checkbox-control">
            <label>
              <input
                type="checkbox"
                checked={allowMultipleChoices}
                onChange={(e) => setAllowMultipleChoices(e.target.checked)}
              />
              <span>{t("filters.allowMultipleChoices")}</span>
            </label>
          </div>
        </div>
        <h2>{t("filters.title")}</h2>

        {features.map(({ key: feature, label, isNumeric }) => {
          // For numeric features, get values from pre-computed data
          // For categorical features, get values from actual data
          const rawValues = isNumeric
            ? data?.numericFeatureValues?.[feature] || []
            : getFeatureValues(data, feature);

          // Use sorting utility for filter button order
          const values = sortFeatureValues(feature, rawValues);

          const currentValues = filteringUtils[feature] || [];
          const isAllSelected = !(feature in filteringUtils);

          return (
            <React.Fragment key={feature}>
              <fieldset className="filter-group">
                <legend className="filter-group-title">
                  {label}{" "}
                  {isPropertyDescribed(feature) && (
                    <Link
                      className="info-link filter-group-info"
                      to={`/${locale}/property/${feature}`}
                      aria-label={`${label} info`}
                    >
                      ⓘ
                    </Link>
                  )}
                </legend>

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
                    className={`checkbox-button ${isAllSelected ? "selected" : ""}`}
                  >
                    {t("filters.all")}
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

                    // Get color for family filters
                    let buttonColor = null;

                    // Get description for title attribute if available
                    const description = getFeatureDescription(feature, value);

                    return (
                      <React.Fragment key={valueKey}>
                        <input
                          className="screenreader-only"
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
                          ${isChecked ? "selected" : ""}
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
              </fieldset>
              {feature === lastChangedFeature &&
                linguisticResults.length > 0 && (
                  <fieldset
                    className="results-fieldset"
                    tabIndex={-1}
                    ref={(el) => {
                      resultsRefs.current[feature] = el;
                    }}
                  >
                    <legend className="results-legend">
                      {t("filters.results", {
                        count: linguisticResults.length,
                      })}
                    </legend>
                    <p
                      className="screenreader-only"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {t("filters.results", {
                        count: linguisticResults.length,
                      })}
                    </p>
                    <ul className="languages-in-group" role="list">
                      {linguisticResults.map((lang) => (
                        <li key={lang.code}>
                          <button
                            className={`language-item-button ${
                              selectedLanguage === lang.code ? "selected" : ""
                            }`}
                            style={{ background: languageColors[lang.code] }}
                            onClick={() => handleSelectLanguage(lang.code)}
                            title={`${lang.name} - ${Object.entries(
                              lang.features,
                            )
                              .filter(([k]) => validFeatureKeys.has(k))
                              .map(([k, v]) => {
                                const featureName = getFeatureName(k);
                                const valueLabel =
                                  typeof v === "number"
                                    ? v
                                    : Array.isArray(v)
                                      ? v
                                          .map((s) => getFeatureLabel(k, s))
                                          .join(", ")
                                      : getFeatureLabel(k, v);
                                return `${featureName}: ${valueLabel}`;
                              })
                              .join(", ")}`}
                          >
                            {lang.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </fieldset>
                )}

              {feature === lastChangedFeature && hasEmptyResult && (
                <div
                  className="filter-empty-message"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  tabIndex={-1}
                  ref={(el) => {
                    emptyRefs.current[feature] = el;
                  }}
                >
                  {t("overlay.emptyFilter")}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default FiltersTab;
