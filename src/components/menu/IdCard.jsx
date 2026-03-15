import { useMemo } from "react";
import { useI18n } from "../../contexts/I18nContext";
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
  sub,
  headingColor,
}) {
  const { locale, t } = useI18n();

  const lineageTrail = useMemo(() => {
    const lineageKey = languageLineages?.[languageCode];
    return getLineageTrail(lineageKey);
  }, [languageCode, languageLineages]);

  const rows = useMemo(() => {
    if (!languageCode || !language) return [];

    const usesNominativeSpeakersLabel = new Set([
      "srp",
      "ces",
      "pol",
      "ukr",
      "mkd",
    ]).has(locale);

    const linguisticRows = getAllFeatures().map(({ key, isNumeric }) => {
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

    const allRows = [
      ...linguisticRows,
      {
        key: "speakers",
        label: usesNominativeSpeakersLabel
          ? t("idCard.speakers")
          : t("controls.sortBy.options.speakers"),
        value: formatSpeakers(language.speakers),
      },
    ];

    return allRows.filter((row) => row.value !== null);
  }, [languageCode, language, locale, t]);

  const normalizedColumnCount = useMemo(() => {
    const parsed = Number.parseInt(columnCount, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [columnCount]);

  const localizedLanguageName = getLocalizedLanguageName(languageCode);

  if (!languageCode || !language || rows.length === 0) {
    return null;
  }

  return (
    <aside
      className="id-card"
      aria-label={localizedLanguageName}
      style={{
        "--id-card-max-columns": normalizedColumnCount,
        "--id-card-heading-color": headingColor || "var(--color-6)",
      }}
    >
      <button
        className="close-button id-card-close-button"
        onClick={() => onToggleSubtitle?.(false)}
        aria-label={t("controls.hasSubtitle.label")}
      >
        <CloseIcon />
      </button>

      <div className="id-card-header">
        <h2 className="id-card-title">
          {localizedLanguageName} ({language.nativeName})
        </h2>

        {lineageTrail.length > 0 && (
          <div className="id-card-breadcrumb-wrap">
            <div className="id-card-breadcrumb" role="list">
              {lineageTrail.map((lineageItem, index) => (
                <span
                  key={lineageItem}
                  className="id-card-breadcrumb-item"
                  role="listitem"
                >
                  {index > 0 && (
                    <span className="id-card-breadcrumb-separator">→</span>
                  )}
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
              {t("idCard.sourceVideo")} ↗
            </a>
          )}
        </div>
      </div>

      <div className="id-card-columns">
        <dl className="id-card-list">
          {rows.map((row) => (
            <div key={row.key} className="id-card-row">
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}

export default IdCard;
