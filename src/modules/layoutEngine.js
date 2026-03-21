import { Vector3 } from "three";
import { sortLanguages } from "../utils/sortingUtils";
import { getLanguageLabel } from "../utils/languageDisplayUtils";

class LayoutEngine {
  constructor() {
    this.algorithms = {
      "sphere-layout": this.sphereLayout.bind(this),
    };
    this.currentAlgorithm = "sphere-layout";
  }

  calculateLayout(data, controls = {}, algorithm = null) {
    const algo = algorithm || this.currentAlgorithm;
    if (!this.algorithms[algo]) {
      console.warn(`Unknown algorithm: ${algo}, falling back to sphere-layout`);
      return this.algorithms["sphere-layout"](data, controls);
    }
    return this.algorithms[algo](data, controls);
  }

  sphereLayout(data, controls = {}) {
    const {
      languageData,
      languageLineages,
      lineageTree,
      speakerData,
      typologicalFeatures,
    } = data;
    const { sortBy, sphereRadius, labelContent, isReverse, segmentation } =
      controls;

    const getClusterKey = (code) => {
      const lang = languageData[code];
      switch (sortBy) {
        case "speakers":
          return "all";
        case "family": {
          const lineageKey = languageLineages[code];
          if (!lineageKey) return "isolate";
          const getRoot = (key) => {
            const ancestors = lineageTree[key];
            if (!ancestors || ancestors.length === 0) return key;
            return getRoot(ancestors[ancestors.length - 1]);
          };
          return getRoot(lineageKey);
        }
        case "alphabetically": {
          const label = getLanguageLabel(code, languageData, labelContent);
          return Array.from(label.trim())[0]?.toLocaleUpperCase("und");
        }
        default:
          return String(lang[sortBy]);
      }
    };

    const allLanguages = Object.keys(languageData);
    const sortedLanguages = sortLanguages({
      allLanguages,
      languageData,
      languageLineages,
      speakerData,
      typologicalFeatures,
      sortBy,
      labelContent,
      isReverse,
    });

    // Base sphere — plain sorted layout, segmentation 0
    const basePoints = this.reorderBySpatialProximity(
      this.generateFibonacciSphere(sortedLanguages.length, sphereRadius),
    );
    const basePositions = {};
    sortedLanguages.forEach((code, i) => {
      basePositions[code] = basePoints[i];
    });

    // Build clusters
    const clusters = {};
    sortedLanguages.forEach((code) => {
      const key = getClusterKey(code);
      if (!clusters[key]) clusters[key] = [];
      clusters[key].push(code);
    });

    const clusterKeys = Object.keys(clusters);
    const avgSize = sortedLanguages.length / clusterKeys.length;

    // Weight centroids by cluster size
    const weightedSpherePoints = this.generateFibonacciSphere(
      sortedLanguages.length,
      sphereRadius,
    );
    let cursor = 0;
    const centroids = {};
    clusterKeys.forEach((key) => {
      const mid = Math.floor(cursor + clusters[key].length / 2);
      centroids[key] = weightedSpherePoints[mid];
      cursor += clusters[key].length;
    });

    // Clustered positions
    const clusteredPositions = {};
    clusterKeys.forEach((key) => {
      const centroid = centroids[key];
      const members = clusters[key];
      const territory =
        sphereRadius * 0.35 * Math.sqrt(members.length / avgSize);
      const localPoints = this.reorderBySpatialProximity(
        this.generateFibonacciSphere(members.length, territory),
      );
      members.forEach((code, j) => {
        clusteredPositions[code] = centroid.clone().add(localPoints[j]);
      });
    });

    // Blend by segmentation (0–100)
    const t = sortBy === "speakers" ? 0 : segmentation / 100;

    const positions = {};
    sortedLanguages.forEach((code) => {
      positions[code] = basePositions[code]
        .clone()
        .lerp(clusteredPositions[code], t);
    });

    return { positions, sortedLanguages };
  }

  generateFibonacciSphere(numPoints, radius) {
    const points = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = Math.PI * 2 * goldenRatio;
    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;
      const x = radius * Math.sin(inclination) * Math.cos(azimuth);
      const y = radius * Math.sin(inclination) * Math.sin(azimuth);
      const z = radius * Math.cos(inclination);
      points.push(new Vector3(x, y, z));
    }
    return points;
  }

  reorderBySpatialProximity(points) {
    if (points.length === 0) return [];
    const ordered = [];
    const remaining = [...points];
    let current = remaining.splice(0, 1)[0];
    ordered.push(current);
    while (remaining.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = current.distanceTo(remaining[0]);
      for (let i = 1; i < remaining.length; i++) {
        const distance = current.distanceTo(remaining[i]);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }
      current = remaining.splice(nearestIndex, 1)[0];
      ordered.push(current);
    }
    return ordered;
  }
}

export { LayoutEngine };
