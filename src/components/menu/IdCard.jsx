import { useMemo } from "react";
import { useI18n } from "../../hooks/useI18n";
import { getLocalizedLanguageName } from "../../i18n/runtime";
import lineages from "../../config/lineages.json";
import { getFeatureLabel, getFeatureName } from "../../utils/linguisticUtils";
import { getFamilyLabel } from "../../utils/configI18nUtils";
import "./IdCard.css";

const formatNumber = (value) => new Intl.NumberFormat().format(value);

const formatSpeakers = (speakersInMillions) => {
  if (!Number.isFinite(speakersInMillions)) return null;
  return formatNumber(Math.round(speakersInMillions * 1000000));
};

const getLineageTrail = (lineageKey) => {
  if (!lineageKey) return [];
  const ancestors = lineages[lineageKey];
  if (!Array.isArray(ancestors)) return [lineageKey];
  return [...ancestors, lineageKey];
};

const getSafeFeatureName = (feature) => {
  try {
    return getFeatureName(feature);
  } catch {
    return feature;
  }
};

const getSafeFeatureValue = (feature, value) => {
  if (value === undefined || value === null || value === "") return null;
  try {
    return getFeatureLabel(feature, value);
  } catch {
    return String(value);
  }
};

function IdCard({ languageCode, language, languageLineages }) {
  const { t } = useI18n();

  const lineageTrail = useMemo(() => {
    const lineageKey = languageLineages?.[languageCode];
    return getLineageTrail(lineageKey);
  }, [languageCode, languageLineages]);

  const rows = useMemo(() => {
    if (!languageCode || !language) return [];

    const allRows = [
      {
        key: "morphology",
        label: getSafeFeatureName("morphology"),
        value: getSafeFeatureValue("morphology", language.morphology),
      },
      {
        key: "wordOrder",
        label: getSafeFeatureName("wordOrder"),
        value: getSafeFeatureValue("wordOrder", language.wordOrder),
      },
      {
        key: "wordOrderFlexibility",
        label: getSafeFeatureName("wordOrderFlexibility"),
        value: getSafeFeatureValue(
          "wordOrderFlexibility",
          language.wordOrderFlexibility,
        ),
      },
      {
        key: "caseCount",
        label: getSafeFeatureName("caseCount"),
        value: Number.isFinite(language.caseCount)
          ? formatNumber(language.caseCount)
          : null,
      },
      {
        key: "nounClassCount",
        label: getSafeFeatureName("nounClassCount"),
        value: Number.isFinite(language.nounClassCount)
          ? formatNumber(language.nounClassCount)
          : null,
      },
      {
        key: "verbAspect",
        label: getSafeFeatureName("verbAspect"),
        value: getSafeFeatureValue("verbAspect", language.verbAspect),
      },
      {
        key: "evidentiality",
        label: getSafeFeatureName("evidentiality"),
        value: getSafeFeatureValue("evidentiality", language.evidentiality),
      },
      {
        key: "tonality",
        label: getSafeFeatureName("tonality"),
        value: getSafeFeatureValue("tonality", language.tonality),
      },
      {
        key: "phonemeCount",
        label: getSafeFeatureName("phonemeCount"),
        value: Number.isFinite(language.phonemeCount)
          ? formatNumber(language.phonemeCount)
          : null,
      },
      {
        key: "maxClusterSize",
        label: getSafeFeatureName("maxClusterSize"),
        value: Number.isFinite(language.maxClusterSize)
          ? formatNumber(language.maxClusterSize)
          : null,
      },
      {
        key: "speakers",
        label: t("controls.sortBy.options.speakers"),
        value: formatSpeakers(language.speakers),
      },
    ];

    return allRows.filter((row) => row.value !== null);
  }, [languageCode, language, t]);

  const midpoint = Math.ceil(rows.length / 2);
  const leftRows = rows.slice(0, midpoint);
  const rightRows = rows.slice(midpoint);

  if (!languageCode || !language || rows.length === 0) {
    return null;
  }

  return (
    <aside
      className="id-card"
      aria-label={getLocalizedLanguageName(languageCode)}
    >
      <div className="id-card-header">
        <h2 className="id-card-title">
          {getLocalizedLanguageName(languageCode)}
        </h2>

        {lineageTrail.length > 0 && (
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
        )}
      </div>

      <div className="id-card-columns">
        <dl className="id-card-list id-card-group">
          {leftRows.map((row) => (
            <div key={row.key} className="id-card-row">
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>

        {rightRows.length > 0 && (
          <dl className="id-card-list id-card-group">
            {rightRows.map((row) => (
              <div key={row.key} className="id-card-row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </aside>
  );
}

export default IdCard;
