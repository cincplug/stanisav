import { useEffect, useMemo, useRef } from "react";
import { useI18nContext } from "../contexts/I18nContext";
import { useLanguageSelectionContext } from "../contexts/LanguageSelectionContext";
import { getLocalizedLanguageName } from "../i18n/runtime";
import { getFamilyLabel } from "../utils/i18nUtils";
import {
  formatNumber,
  formatSpeakers,
  getAllFeatures,
  getFeatureDescription,
  getFeatureLabel,
  getFeatureName,
  getLineageTrail,
  isPropertyDescribed,
} from "../utils/linguisticUtils";
import "./IdCard.css";
import { CloseIcon, ChevronIcon } from "./Icons";
import Tooltip from "./ux/Tooltip";

function IdCard({
  isVisible,
  languageCode,
  language,
  columnCount = 4,
  sampleUrl,
  onSourceVideoClick,
  onToggleSubtitle,
}) {
  const { locale, t } = useI18nContext();

  const lineageTrail = useMemo(() => {
    const lineageKey = language?.lineageKey;
    return getLineageTrail(lineageKey);
  }, [language?.lineageKey]);

  const { selectedProperty } = useLanguageSelectionContext();

  const properties = useMemo(() => {
    if (!languageCode || !language) return [];

    const linguisticProperties = getAllFeatures().map(({ key, isNumeric }) => {
      const rawValue = language[key];

      if (rawValue === undefined || rawValue === null || rawValue === "") {
        return null;
      }

      return {
        key,
        label: getFeatureName(key),
        value: isNumeric
          ? Number.isFinite(rawValue)
            ? formatNumber(rawValue)
            : null
          : Array.isArray(rawValue)
            ? rawValue.map((v) => getFeatureLabel(key, v)).join(", ")
            : getFeatureLabel(key, rawValue),
      };
    });

    const allProperties = [
      ...linguisticProperties,
      {
        key: "speakers",
        label: t("controls.sortBy.options.speakers"),
        value: formatSpeakers(language.speakers),
      },
    ];

    return allProperties.filter((property) => property.value !== null);
  }, [languageCode, language, locale, t]);

  const normalizedColumnCount = useMemo(() => {
    const parsed = Number.parseInt(columnCount, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [columnCount]);

  const closeButtonRef = useRef(null);

  const localizedLanguageName = getLocalizedLanguageName(languageCode);

  const tooltipButtonRefs = useRef({});

  useEffect(() => {
    if (selectedProperty && tooltipButtonRefs.current[selectedProperty]) {
      tooltipButtonRefs.current[selectedProperty].click();
    }
  }, [selectedProperty]);

  if (!languageCode || !language || properties.length === 0) {
    return null;
  }

  return (
    <aside
      className="id-card"
      aria-label={localizedLanguageName}
      style={{
        "--id-card-max-columns": normalizedColumnCount,
      }}
    >
      <div className="id-card-header">
        <div>{language.nativeName}</div>
        <h2 className="id-card-title">{localizedLanguageName}</h2>
        <div className="id-card-actions">
          {sampleUrl && (
            <a
              className="id-card-source-video"
              href={sampleUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onSourceVideoClick}
              aria-label={`${localizedLanguageName} ${t("idCard.sourceVideo")} (${t("idCard.opensInNewTab")})`}
            >
              {t("idCard.sourceVideo")} <span className="white">↗</span>
            </a>
          )}
        </div>
      </div>

      <button
        ref={closeButtonRef}
        className="close-button id-card-close-button"
        onClick={() => onToggleSubtitle?.(!isVisible)}
        aria-label={t("controls.isIdCardVisible.label")}
      >
        {isVisible ? <CloseIcon /> : <ChevronIcon className="id-card-expand" />}
      </button>

      {isVisible && (
        <div className="id-card-columns">
          {lineageTrail.length > 0 && (
            <div className="id-card-breadcrumb" role="list">
              <dt>{t("controls.sortBy.options.family")}:</dt>
              <dd>
                {lineageTrail.map((lineageItem, index) => (
                  <span key={lineageItem} className="id-card-breadcrumb-item">
                    {index > 0 && <span className="sign">→</span>}
                    <span>{getFamilyLabel(lineageItem)}</span>
                  </span>
                ))}
              </dd>
            </div>
          )}
          <dl className="id-card-list" role="list">
            {properties.map((property) => {
              const canSelect = isPropertyDescribed(property.key);
              const isSelected = selectedProperty === property.key;
              return (
                <div
                  key={property.key}
                  className={`id-card-property-row${isSelected ? " selected" : ""}`}
                  role="group"
                  aria-label={property.label}
                >
                  <dt className="id-card-property-label">{property.label}:</dt>
                  <dd className="id-card-property-value">{property.value}</dd>
                  <span className="id-card-property-info-cell">
                    {canSelect && (
                      <Tooltip
                        id={`idcard-${property.key}`}
                        label={property.label}
                        position="top"
                        className="info-link"
                        triggerRef={(el) => {
                          tooltipButtonRefs.current[property.key] = el;
                        }}
                      >
                        {getFeatureDescription(
                          property.key,
                          language[property.key],
                        )}
                      </Tooltip>
                    )}
                  </span>
                </div>
              );
            })}
          </dl>
        </div>
      )}
    </aside>
  );
}

export default IdCard;
