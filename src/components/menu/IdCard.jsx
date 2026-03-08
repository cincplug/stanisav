import { useMemo } from "react";
import { useI18n } from "../../hooks/useI18n";
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
import "./IdCard.css";

function IdCard({
  languageCode,
  language,
  languageLineages,
  columnCount = 4,
  sampleUrl,
  onSourceVideoClick,
  sub,
}) {
  const { t } = useI18n();

  const lineageTrail = useMemo(() => {
    const lineageKey = languageLineages?.[languageCode];
    return getLineageTrail(lineageKey);
  }, [languageCode, languageLineages]);

  const rows = useMemo(() => {
    if (!languageCode || !language) return [];

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
          : getFeatureLabel(key, rawValue),
      };
    });

    const allRows = [
      ...linguisticRows,
      {
        key: "speakers",
        label: t("controls.sortBy.options.speakers"),
        value: formatSpeakers(language.speakers),
      },
    ];

    return allRows.filter((row) => row.value !== null);
  }, [languageCode, language, t]);

  const normalizedColumnCount = useMemo(() => {
    const parsed = Number.parseInt(columnCount, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [columnCount]);

  const columns = useMemo(() => {
    if (rows.length === 0) return [];

    const actualColumnCount = Math.min(normalizedColumnCount, rows.length);
    const rowsPerColumn = Math.ceil(rows.length / actualColumnCount);

    return Array.from({ length: actualColumnCount }, (_, index) =>
      rows.slice(index * rowsPerColumn, (index + 1) * rowsPerColumn),
    ).filter((group) => group.length > 0);
  }, [rows, normalizedColumnCount]);

  const localizedLanguageName = getLocalizedLanguageName(languageCode);

  if (!languageCode || !language || rows.length === 0) {
    return null;
  }

  return (
    <aside
      className="id-card"
      aria-label={localizedLanguageName}
      style={{ "--id-card-columns": columns.length }}
    >
      <p className="subtitle">{sub}</p>
      <div className="id-card-header">
        <h2 className="id-card-title">{localizedLanguageName}</h2>

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

        {sampleUrl && (
          <a
            href={sampleUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onSourceVideoClick}
            aria-label={`${localizedLanguageName} Source Video (opens in new tab)`}
          >
            Source Video ↗
          </a>
        )}
      </div>

      <div className="id-card-columns">
        {columns.map((group, groupIndex) => (
          <dl
            key={`id-card-col-${groupIndex}`}
            className="id-card-list id-card-group"
          >
            {group.map((row) => (
              <div key={row.key} className="id-card-row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
    </aside>
  );
}

export default IdCard;
