import lineages from "../config/lineages.json";
import { Vector3 } from "three";

const getFamily = (lineageKey) => {
  const lineage = lineages[lineageKey];
  if (!Array.isArray(lineage)) {
    throw new Error(`Missing lineage for '${lineageKey}' in lineages.json`);
  }
  return lineage.length > 0 ? lineage[0] : lineageKey;
};

export const calculateLanguageFilterStatus = (
  languages,
  typologicalFeatures,
  filteringUtils,
  languageLineages,
) => {
  if (Object.keys(filteringUtils).length === 0) {
    return languages.reduce((acc, langCode) => {
      acc[langCode] = { isVisible: true };
      return acc;
    }, {});
  }

  return languages.reduce((acc, langCode) => {
    const matchesFilters = Object.entries(filteringUtils).every(
      ([feature, values]) => {
        if (!values || !Array.isArray(values) || values.length === 0) {
          return true;
        }

        if (feature === "family") {
          const languageLineage = languageLineages?.[langCode];
          const languageFamily = getFamily(languageLineage);
          return values.includes(languageFamily);
        }

        const features = typologicalFeatures?.[langCode];
        if (!features) {
          return false;
        }

        const featureValue = features[feature];
        if (Array.isArray(featureValue)) {
          return featureValue.some((v) => values.includes(v));
        }
        if (typeof featureValue === "number") {
          return values.map(Number).includes(featureValue);
        }
        return values.includes(featureValue);
      },
    );

    acc[langCode] = {
      isVisible: matchesFilters,
    };
    return acc;
  }, {});
};

export const calculateRadialOffset = (position) => {
  const length = Math.sqrt(
    position[0] * position[0] +
      position[1] * position[1] +
      position[2] * position[2],
  );
  if (length === 0) return [0, 0, 0];
  return [position[0] / length, position[1] / length, position[2] / length];
};

// Returns the centroid X and minimum Y of a cluster's positions,
// used to anchor the cluster title below the cluster center.
export const getClusterBottomCenter = (positions) => {
  const pts = Object.values(positions);
  if (pts.length === 0) return null;
  const sumX = pts.reduce((s, p) => s + p.x, 0);
  const minY = pts.reduce((min, p) => Math.min(min, p.y), Infinity);
  const avgZ = pts.reduce((s, p) => s + p.z, 0) / pts.length;
  return new Vector3(sumX / pts.length, minY, avgZ);
};

export const getStageLightConfig = (params) => {
  if (params.isSegmented) {
    params.stageLightDistance *= 1.2;
  }

  return params;
};
