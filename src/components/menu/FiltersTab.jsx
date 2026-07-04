import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useI18nContext } from "../../contexts/I18nContext";
import { useLanguageSelectionContext } from "../../contexts/LanguageSelectionContext";
import { usePlaylistContext } from "../../contexts/PlaylistContext";
import {
  filterLanguagesByFeatures,
  getFeatureValues,
} from "../../utils/filteringUtils";
import {
  getAllFeatures,
  getFeatureDescription,
  getFeatureLabel,
  isPropertyDescribed,
} from "../../utils/linguisticUtils";
import { sortFeatureValues } from "../../utils/sortingUtils";
import "./FiltersTab.css";
import LanguageTree from "./LanguageTree";
import { ZoomDistanceIcon } from "../Icons";
import Properties from "./Properties";
import Tooltip from "../ux/Tooltip";

function FiltersTab({ data, languageColors = {} }) {
  const { viewAllLanguages, selectedLanguage } = useLanguageSelectionContext();
  const { pausePlaylist, startFromLanguage } = usePlaylistContext();
  const { filters, updateFilters } = useLanguageSelectionContext();

  const features = getAllFeatures();
  const [allowMultipleChoices, setAllowMultipleChoices] = useState(false);
  const [lastChangedFeature, setLastChangedFeature] = useState(null);
  const buttonRefs = useRef({});
  const fieldsetRefs = useRef({});
  const { t } = useI18nContext();

  const handleCheckboxChange = (feature, value, checked) => {
    let newFilters = { ...filters };
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

    setLastChangedFeature(Object.keys(newFilters).length > 0 ? feature : null);
    updateFilters(newFilters, data);
  };

  const filterResults = useMemo(() => {
    if (Object.keys(filters).length === 0) {
      return [];
    }
    return filterLanguagesByFeatures(data, filters);
  }, [data, filters]);

  const hasActiveFilters = Object.keys(filters).length > 0;
  const hasEmptyResult = hasActiveFilters && filterResults.length === 0;

  // Scroll to the fieldset of the last-changed feature so both the filter
  // section and its results below come into view together.
  useEffect(() => {
    if (!hasActiveFilters || !lastChangedFeature) return;

    const el = fieldsetRefs.current[lastChangedFeature];
    if (!el) return;

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
  }, [filterResults, hasActiveFilters, lastChangedFeature]);

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

  const activeFilterSummary = useMemo(() => {
    return Object.entries(filters)
      .map(([feature, values]) => {
        const featureMeta = features.find((f) => f.key === feature);
        const featureLabel = featureMeta?.label ?? feature;
        const valueLabels = values.map((v) =>
          featureMeta?.isNumeric ? v : getFeatureLabel(feature, v),
        );
        return `${featureLabel}: ${valueLabels.join(", ")}`;
      })
      .join(" · ");
  }, [filters, features]);

  const resultLanguageCodes = useMemo(
    () => filterResults.map((lang) => lang.code),
    [filterResults],
  );

  const renderResults = () => (
    <section className="filter-results">
      {hasEmptyResult ? (
        // role="status" announces the empty state when it appears,
        // and remains readable by navigation since it's not aria-hidden.
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="filter-results-empty"
        >
          {t("overlay.emptyFilter")}
        </p>
      ) : (
        <>
          {allowMultipleChoices && (
            <p className="filter-results-summary">{activeFilterSummary}</p>
          )}
          {/* role="status" on the heading announces the result count
              automatically when results change, without hiding it from AT. */}
          <h4
            className="filter-results-title"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {t("filters.results", { count: filterResults.length })}
          </h4>
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
  );

  const resultAnchorFeature =
    lastChangedFeature ?? Object.keys(filters)[0] ?? null;

  return (
    <div className="control-section">
      <div className="filters">
        {features.map(({ key: feature, label, isNumeric }) => {
          const rawValues = isNumeric
            ? data?.numericFeatureValues?.[feature] || []
            : getFeatureValues(data, feature);

          const values = sortFeatureValues(feature, rawValues);
          const currentValues = filters[feature] || [];
          const isAllSelected = !(feature in filters);

          return (
            <React.Fragment key={feature}>
              <fieldset
                className="filter-group"
                ref={(el) => {
                  fieldsetRefs.current[feature] = el;
                }}
              >
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
                {hasActiveFilters &&
                  feature === resultAnchorFeature &&
                  renderResults()}
              </fieldset>
            </React.Fragment>
          );
        })}
      </div>
      <div className="filters-tab-footer">
        <button onClick={handleViewAll} className="view-all-button has-icon">
          <ZoomDistanceIcon className="icon" />
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
    </div>
  );
}

export default FiltersTab;
