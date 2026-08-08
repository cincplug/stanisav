import { Vector3 } from "three";
import lineages from "../config/lineages.json";

const getFamily = (lineageKey) => {
  const lineage = lineages[lineageKey];
  if (!Array.isArray(lineage)) {
    throw new Error(`Missing lineage for '${lineageKey}' in lineages.json`);
  }
  return lineage.length > 0 ? lineage[0] : lineageKey;
};

export const calculateLanguageFilterStatus = (
  languageCodes,
  languages,
  filters,
) => {
  if (Object.keys(filters).length === 0) {
    return languageCodes.reduce((acc, langCode) => {
      acc[langCode] = { isVisible: true };
      return acc;
    }, {});
  }

  return languageCodes.reduce((acc, langCode) => {
    const lang = languages?.[langCode];
    if (!lang) {
      acc[langCode] = { isVisible: false };
      return acc;
    }

    const matchesFilters = Object.entries(filters).every(
      ([feature, values]) => {
        if (!values || !Array.isArray(values) || values.length === 0) {
          return true;
        }

        if (feature === "family") {
          const languageLineage = lang.lineageKey;
          const languageFamily = getFamily(languageLineage);
          return values.includes(languageFamily);
        }

        const featureValue = lang[feature];
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

export const getClusterTopCenter = (positions) => {
  const pts = Object.values(positions);
  if (pts.length === 0) return null;
  const sumX = pts.reduce((s, p) => s + p.x, 0);
  const maxY = pts.reduce((max, p) => Math.max(max, p.y), -Infinity);
  const avgZ = pts.reduce((s, p) => s + p.z, 0) / pts.length;
  return new Vector3(sumX / pts.length, maxY, avgZ);
};

// Approximates how far the "fit everything" wide camera shot sits from the
// sphere's center, using its nominal radius and vertical field of view.
// Used to scale Stanisav so his apparent screen size matches between the wide
// shot and a zoomed-in language, without a hand-tuned magic number.
export const calculateWideShotScale = (sphereRadius, zoomDistance, fov) => {
  const halfFovRadians = (fov * Math.PI) / 180 / 2;
  const wideShotDistance = sphereRadius / Math.tan(halfFovRadians);
  return wideShotDistance / zoomDistance;
};

// Computes Stanisav's world-space position from a language node, offset
// outward from it so he doesn't overlap the node's own label. Falls back to
// the origin when no node is available (e.g. before language data loads).
export const calculateStanisavPosition = (
  languagePosition,
  { isBlackboard, labelOffset, labelSize },
) => {
  if (!languagePosition) return [0, 0, 0];

  const basePosition = [
    languagePosition.x,
    languagePosition.y,
    languagePosition.z,
  ];
  const radialOffset = calculateRadialOffset(basePosition);

  if (isBlackboard) {
    return [
      basePosition[0],
      basePosition[1] + radialOffset[1] + labelSize,
      basePosition[2] + radialOffset[2] + labelOffset,
    ];
  }

  return [
    basePosition[0] + radialOffset[0] * labelOffset,
    basePosition[1] + radialOffset[1] * labelOffset + labelSize,
    basePosition[2] + radialOffset[2] * labelOffset,
  ];
};
