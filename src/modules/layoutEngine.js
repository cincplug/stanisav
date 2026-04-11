import { Vector3 } from "three";
import {
  sortLanguages,
  comparePath,
  getLineagePathForKey,
} from "../utils/sortingUtils";
import { getLanguageLabel } from "../utils/languageDisplayUtils";
import { getSpeakerGroup } from "../utils/languageGroupingUtils";
import sceneConfig from "../config/sceneConfig.json";

const { spiralAxis } = sceneConfig;

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
    const { languageData, languageLineages, speakerData, typologicalFeatures } =
      data;
    const {
      sortBy,
      sphereRadius,
      labelContent,
      isReverse,
      isSegmented,
      irrationality,
    } = controls;

    const getClusterKey = (code) => {
      switch (sortBy) {
        case "speakers":
          return isSegmented
            ? (getSpeakerGroup(languageData[code].speakers)?.title ?? "all")
            : "all";
        case "family":
          return languageLineages[code] ?? "isolate";
        case "alphabetically": {
          const label = getLanguageLabel(code, languageData, labelContent);
          return Array.from(label.trim())[0]?.toLocaleUpperCase("und");
        }
        default:
          return String(languageData[code][sortBy]);
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

    if (sortedLanguages.length === 0) {
      return { positions: {}, sortedLanguages: [] };
    }

    const angularBasePoints = this.sortSpherePointsByAngle(
      this.generateFibonacciSphere(
        sortedLanguages.length,
        sphereRadius,
        irrationality,
      ),
    );

    // Keep the legacy angular distribution, but smooth local traversal with
    // proximity ordering so language-to-point mapping stays stable for playback.
    const proximityOrderedBasePoints = this.reorderBySpatialProximity(
      angularBasePoints,
      {
        maxLookahead: Math.max(
          8,
          Math.round(Math.sqrt(sortedLanguages.length)),
        ),
      },
    );
    const basePoints = this.rotatePointsToFrontFacingAnchor(
      proximityOrderedBasePoints,
    );
    const basePositions = {};
    sortedLanguages.forEach((code, i) => {
      basePositions[code] = basePoints[i];
    });

    const clusters = {};
    sortedLanguages.forEach((code) => {
      const key = getClusterKey(code);
      if (!clusters[key]) clusters[key] = [];
      clusters[key].push(code);
    });

    // For family sort, order cluster keys by lineage path so sibling families
    // end up adjacent in the grid. All other sorts preserve insertion order.
    const clusterKeys =
      sortBy === "family"
        ? Object.keys(clusters).sort((a, b) =>
            comparePath(getLineagePathForKey(a), getLineagePathForKey(b)),
          )
        : Object.keys(clusters);

    const nodeSpacing = Math.sqrt(
      (4 * Math.PI * sphereRadius ** 2) / sortedLanguages.length,
    );

    const clusterRadii = {};
    clusterKeys.forEach((key) => {
      const n = clusters[key].length;
      clusterRadii[key] = nodeSpacing * Math.sqrt(n / (4 * Math.PI));
    });

    const numCols = Math.min(
      Math.max(1, Math.round(Math.sqrt(clusterKeys.length))),
      clusterKeys.length,
    );

    const columns = Array.from({ length: numCols }, () => []);
    clusterKeys.forEach((key, i) => {
      columns[i % numCols].push(key);
    });

    const colWidths = columns.map((col) =>
      col.length > 0 ? Math.max(...col.map((key) => clusterRadii[key])) : 0,
    );
    const colHeights = columns.map((col) =>
      col.reduce(
        (sum, key, i) =>
          sum + clusterRadii[key] * 2 + (i > 0 ? nodeSpacing : 0),
        0,
      ),
    );

    const totalWidth = colWidths.reduce(
      (sum, w, i) => sum + w * 2 + (i > 0 ? nodeSpacing : 0),
      0,
    );
    const totalHeight = Math.max(...colHeights);

    const clusterOffsets = {};
    let cursorX = -totalWidth / 2;
    columns.forEach((col, colIndex) => {
      const colWidth = colWidths[colIndex];
      const colCenterX = cursorX + colWidth;

      let cursorY = totalHeight / 2;
      col.forEach((key, rowIndex) => {
        const r = clusterRadii[key];
        if (rowIndex > 0) cursorY -= nodeSpacing;
        cursorY -= r;
        clusterOffsets[key] = new Vector3(colCenterX, cursorY, 0);
        cursorY -= r;
      });

      cursorX += colWidth * 2 + nodeSpacing;
    });

    const clusteredPositions = {};
    clusterKeys.forEach((key) => {
      const offset = clusterOffsets[key];
      const members = clusters[key];
      const r = clusterRadii[key];
      const localPoints = this.sortSpherePointsByAngle(
        this.generateFibonacciSphere(members.length, r, irrationality),
      );
      members.forEach((code, j) => {
        clusteredPositions[code] = localPoints[j].clone().add(offset);
      });
    });

    const t = isSegmented ? 1 : 0;

    const positions = {};
    sortedLanguages.forEach((code) => {
      positions[code] = basePositions[code]
        .clone()
        .lerp(clusteredPositions[code], t);
    });

    return { positions, sortedLanguages };
  }

  generateFibonacciSphere(numPoints, radius, irrationality) {
    const points = [];
    const notNecessarilyGoldenRatio = Math.sqrt(irrationality) + 1;
    const angleIncrement = Math.PI * 2 * notNecessarilyGoldenRatio;
    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;
      const sin = radius * Math.sin(inclination);
      const cos = radius * Math.cos(inclination);
      const u = sin * Math.cos(azimuth);
      const v = sin * Math.sin(azimuth);
      const point =
        spiralAxis === "x"
          ? new Vector3(cos, u, v)
          : spiralAxis === "z"
            ? new Vector3(u, v, cos)
            : new Vector3(u, cos, v); // y (default)
      points.push(point);
    }
    return points;
  }

  reorderBySpatialProximity(points, options = {}) {
    if (points.length === 0) return [];

    const { maxLookahead = Number.POSITIVE_INFINITY } = options;

    const ordered = [];
    const remaining = [...points];
    let current = remaining.splice(0, 1)[0];

    ordered.push(current);

    while (remaining.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = current.distanceTo(remaining[0]);

      const searchLimit = Math.min(remaining.length, maxLookahead);

      for (let i = 1; i < searchLimit; i += 1) {
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

  rotatePointsToFrontFacingAnchor(points) {
    if (points.length <= 1) return points;

    // Score each candidate cut by front-facingness (z) multiplied by the
    // gap to its predecessor. This selects a cut that is both camera-facing
    // and sits at a natural large break in the path, keeping first and last
    // elements far apart.
    let bestIndex = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < points.length; i += 1) {
      const p = points[i];
      const prev = points[(i - 1 + points.length) % points.length];
      const score = p.z * p.distanceTo(prev);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    if (bestIndex === 0) return points;

    return [...points.slice(bestIndex), ...points.slice(0, bestIndex)];
  }

  sortSpherePointsByAngle(points) {
    const bandCount = Math.round(Math.sqrt(points.length));

    return [...points].sort((a, b) => {
      const latA =
        spiralAxis === "x"
          ? Math.atan2(Math.sqrt(a.y ** 2 + a.z ** 2), a.x)
          : spiralAxis === "z"
            ? Math.atan2(Math.sqrt(a.x ** 2 + a.y ** 2), a.z)
            : Math.atan2(Math.sqrt(a.x ** 2 + a.z ** 2), a.y); // y (default)
      const latB =
        spiralAxis === "x"
          ? Math.atan2(Math.sqrt(b.y ** 2 + b.z ** 2), b.x)
          : spiralAxis === "z"
            ? Math.atan2(Math.sqrt(b.x ** 2 + b.y ** 2), b.z)
            : Math.atan2(Math.sqrt(b.x ** 2 + b.z ** 2), b.y); // y (default)
      const bandA = Math.floor((latA / Math.PI) * bandCount);
      const bandB = Math.floor((latB / Math.PI) * bandCount);

      if (bandA !== bandB) return bandA - bandB;

      const lonA =
        spiralAxis === "x"
          ? Math.atan2(a.z, a.y)
          : spiralAxis === "z"
            ? Math.atan2(a.y, a.x)
            : Math.atan2(a.z, a.x);
      const lonB =
        spiralAxis === "x"
          ? Math.atan2(b.z, b.y)
          : spiralAxis === "z"
            ? Math.atan2(b.y, b.x)
            : Math.atan2(b.z, b.x);
      return bandA % 2 === 0 ? lonA - lonB : lonB - lonA;
    });
  }
}

export { LayoutEngine };
