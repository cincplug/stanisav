import { Vector3 } from "three";
import {
  sortLanguages,
  comparePath,
  getLineagePathForKey,
} from "../utils/sortingUtils";
import { getLanguageLabel } from "../utils/languageDisplayUtils";
import { getSpeakerGroup } from "../utils/languageGroupingUtils";

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
    const { sortBy, sphereRadius, labelContent, isReverse, isSegmented } =
      controls;

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

    const basePoints = this.sortSpherePointsByAngle(
      this.generateFibonacciSphere(sortedLanguages.length, sphereRadius),
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
        this.generateFibonacciSphere(members.length, r),
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

  sortSpherePointsByAngle(points) {
    const bandCount = Math.round(Math.sqrt(points.length));

    return [...points].sort((a, b) => {
      const latA = Math.atan2(Math.sqrt(a.x ** 2 + a.y ** 2), a.z);
      const latB = Math.atan2(Math.sqrt(b.x ** 2 + b.y ** 2), b.z);
      const bandA = Math.floor((latA / Math.PI) * bandCount);
      const bandB = Math.floor((latB / Math.PI) * bandCount);

      if (bandA !== bandB) return bandA - bandB;

      const lonA = Math.atan2(a.y, a.x);
      const lonB = Math.atan2(b.y, b.x);
      return bandA % 2 === 0 ? lonA - lonB : lonB - lonA;
    });
  }
}

export { LayoutEngine };
