import { useMemo, useRef, useEffect } from "react";
import { useI18n } from "../../contexts/I18nContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { getLocalizedLanguageName } from "../../i18n/runtime";
import {
  getAllFeatures,
  getFeatureLabel,
  getFeatureName,
  formatNumber,
  formatSpeakers,
  getLineageTrail,
} from "../../utils/linguisticUtils";
import { getFamilyLabel } from "../../utils/configI18nUtils";
import { CloseIcon } from "./MenuIcons";
import "./IdCard.css";

function IdCard({
  languageCode,
  language,
  languageLineages,
  columnCount = 4,
  sampleUrl,
  onSourceVideoClick,
  onToggleSubtitle,
  headingColor,
}) {
  const { locale, t } = useI18n();

  const lineageTrail = useMemo(() => {
    const lineageKey = languageLineages?.[languageCode];
    return getLineageTrail(lineageKey);
  }, [languageCode, languageLineages]);

  const { selectedProperty, setSelectedProperty } = useLanguageSelection();

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

  if (!languageCode || !language || properties.length === 0) {
    return null;
  }

  return (
    <aside
      className="id-card"
      aria-label={localizedLanguageName}
      style={{
        "--id-card-max-columns": normalizedColumnCount,
        "--id-card-heading-color": headingColor || "var(--color-4)",
      }}
    >
      <button
        ref={closeButtonRef}
        className="close-button id-card-close-button"
        onClick={() => onToggleSubtitle?.(false)}
        aria-label={t("controls.isInfoVisible.label")}
      >
        <CloseIcon />
      </button>

      <div className="id-card-header">
        <h2 className="id-card-title">
          {localizedLanguageName} <span className="white">(</span>
          {language.nativeName}
          <span className="white">)</span>
        </h2>

        {lineageTrail.length > 0 && (
          <div className="id-card-breadcrumb-wrap">
            <div className="id-card-breadcrumb" role="list">
              {lineageTrail.map((lineageItem, index) => (
                <span key={lineageItem} className="id-card-breadcrumb-item">
                  {index > 0 && <span className="white">→</span>}
                  <span>{getFamilyLabel(lineageItem)}</span>
                </span>
              ))}
            </div>
          </div>
        )}

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

      <div className="id-card-columns">
        <div className="id-card-list" role="list">
          {properties.map((property) => (
            <button
              key={property.key}
              type="button"
              className={`id-card-property${property.key === selectedProperty ? " selected" : ""}`}
              aria-pressed={property.key === selectedProperty}
              onClick={() =>
                setSelectedProperty(
                  selectedProperty === property.key ? null : property.key,
                )
              }
            >
              <span className="id-card-property-label">{property.label}:</span>
              <span className="id-card-property-value">{property.value}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default IdCard;
