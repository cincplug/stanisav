import React, {
  useMemo,
  useRef,
  useCallback,
  useState,
  useEffect,
} from "react";
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
import Tooltip from "./ux/Tooltip";
import Properties from "./Properties";
import LanguageTree from "./LanguageTree";
import "./FiltersTab.css";

function FiltersTab({ data, languageColors = {} }) {
  const { viewAllLanguages, selectedLanguage } = useLanguageSelection();
  const { pausePlaylist, startFromLanguage } = usePlaylist();
  const {
    filteringUtils,
    updateFilteringUtils,
    selectedProperty,
    setSelectedProperty,
  } = useLanguageSelection();

  const features = getAllFeatures();
  const [allowMultipleChoices, setAllowMultipleChoices] = useState(false);
  const resultsRef = useRef(null);
  const resultsStatusRef = useRef(null);
  const buttonRefs = useRef({});
  const { t } = useI18n();

  const handleCheckboxChange = (feature, value, checked) => {
    let newFilters = { ...filteringUtils };
    const currentValues = newFilters[feature] || [];

    if (value === "all") {
      if (checked) {
        delete newFilters[feature];
      }
    } else {
      if (checked) {
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
    return filterLanguagesByFeatures(data, filteringUtils);
  }, [data, filteringUtils]);

  const hasActiveFilters = Object.keys(filteringUtils).length > 0;
  const hasEmptyResult = hasActiveFilters && linguisticResults.length === 0;

  // Scroll to results section whenever the filter results change and filters are active.
  // Uses scrollTo instead of scrollIntoView to manually subtract the sticky header height.
  useEffect(() => {
    if (!hasActiveFilters || !resultsRef.current) return;

    const el = resultsRef.current;
    const scrollParent = el.closest(".menu-scroll-area");
    if (!scrollParent) return;

    const stickyHeader = scrollParent
      .closest(".menu")
      ?.querySelector(".menu-sticky-top");
    const stickyOffset = stickyHeader
      ? stickyHeader.getBoundingClientRect().height
      : 0;

    const elTop = el.getBoundingClientRect().top;
    const parentTop = scrollParent.getBoundingClientRect().top;
    const currentScroll = scrollParent.scrollTop;

    scrollParent.scrollTo({
      top: currentScroll + (elTop - parentTop) - stickyOffset,
      behavior: "smooth",
    });
  }, [linguisticResults, hasActiveFilters]);

  const handleViewAll = () => {
    pausePlaylist();
    viewAllLanguages();
  };

  const onSelectLanguage = useCallback(
    (langCode) => {
      startFromLanguage(langCode);
    },
    [startFromLanguage],
  );

  // Build a human-readable summary of active filters for display above results,
  // e.g. "Tonalità: Tonale complessa · Morfologia: Isolante, Agglutinante"
  const activeFilterSummary = useMemo(() => {
    return Object.entries(filteringUtils)
      .map(([feature, values]) => {
        const featureMeta = features.find((f) => f.key === feature);
        const featureLabel = featureMeta?.label ?? feature;
        const valueLabels = values.map((v) =>
          featureMeta?.isNumeric ? v : getFeatureLabel(feature, v),
        );
        return `${featureLabel}: ${valueLabels.join(", ")}`;
      })
      .join(" · ");
  }, [filteringUtils, features]);

  // Flat list of language codes from results for LanguageTree
  const resultLanguageCodes = useMemo(
    () => linguisticResults.map((lang) => lang.code),
    [linguisticResults],
  );

  return (
    <div className="control-section">
      <div className="linguistic-filters">
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
          const rawValues = isNumeric
            ? data?.numericFeatureValues?.[feature] || []
            : getFeatureValues(data, feature);

          const values = sortFeatureValues(feature, rawValues);
          const currentValues = filteringUtils[feature] || [];
          const isAllSelected = !(feature in filteringUtils);

          return (
            <fieldset key={feature} className="filter-group">
              <legend className="filter-group-title">
                {label}{" "}
                {isPropertyDescribed(feature) && (
                  <Tooltip
                    id={`tooltip-${feature}`}
                    label={`${label} info`}
                    position="left"
                    className="info-link"
                  >
                    <Properties propertyKey={feature} />
                  </Tooltip>
                )}
              </legend>

              <div
                className="checkbox-button-group"
                role="group"
                aria-label={label}
              >
                <input
                  className="screenreader-only"
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
                  const displayLabel = isNumeric
                    ? value
                    : getFeatureLabel(feature, value);
                  const valueKey = isNumeric ? value : value;
                  const isChecked = isNumeric
                    ? currentValues.map(Number).includes(Number(value))
                    : currentValues.includes(value);

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
                        className={`checkbox-button ${isChecked ? "selected" : ""}`}
                        title={description || undefined}
                      >
                        {displayLabel}
                      </label>
                    </React.Fragment>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        {/* Results section — visible for all users, not just screen readers */}
        {hasActiveFilters && (
          <section ref={resultsRef} className="filter-results">
            {/* Screen reader live announcement */}
            <div
              ref={resultsStatusRef}
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="screenreader-only"
            >
              {hasEmptyResult
                ? `${activeFilterSummary} — ${t("overlay.emptyFilter")}`
                : `${activeFilterSummary} — ${t("filters.results", { count: linguisticResults.length })}`}
            </div>

            {hasEmptyResult ? (
              <p className="filter-results-empty" aria-hidden="true">
                {t("overlay.emptyFilter")}
              </p>
            ) : (
              <>
                <p className="filter-results-summary" aria-hidden="true">
                  {activeFilterSummary}
                </p>
                <h3 className="filter-results-heading" aria-hidden="true">
                  {t("filters.results", { count: linguisticResults.length })}
                </h3>
                <div className="languages-list">
                  <LanguageTree
                    languages={resultLanguageCodes}
                    languageData={data}
                    labelContent="name"
                    selectedLanguage={selectedLanguage}
                    buttonRefs={buttonRefs}
                    onSelectLanguage={onSelectLanguage}
                    languageColors={languageColors}
                  />
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default FiltersTab;
