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

    if (sortedLanguages.length === 0) {
      return { positions: {}, sortedLanguages: [] };
    }

    // Base sphere — plain sorted layout, segmentation 0
    const basePoints = this.sortSpherePointsByAngle(
      this.generateFibonacciSphere(sortedLanguages.length, sphereRadius),
    );
    const basePositions = {};
    sortedLanguages.forEach((code, i) => {
      basePositions[code] = basePoints[i];
    });

    // Build clusters — insertion order follows sortedLanguages, preserving
    // the natural group order established by sortLanguages
    const clusters = {};
    sortedLanguages.forEach((code) => {
      const key = getClusterKey(code);
      if (!clusters[key]) clusters[key] = [];
      clusters[key].push(code);
    });

    const clusterKeys = Object.keys(clusters);

    // Derive inter-node spacing from the main sphere so all cluster spheres
    // share the same surface density. Approximate: d ≈ sqrt(4π r² / n)
    const nodeSpacing = Math.sqrt(
      (4 * Math.PI * sphereRadius ** 2) / sortedLanguages.length,
    );

    // Each cluster radius scaled so its surface density matches the main sphere
    const clusterRadii = {};
    clusterKeys.forEach((key) => {
      const n = clusters[key].length;
      clusterRadii[key] = nodeSpacing * Math.sqrt(n / (4 * Math.PI));
    });

    // Target number of columns: sqrt of cluster count, rounded,
    // clamped so we never have more columns than clusters
    const numCols = Math.min(
      Math.max(1, Math.round(Math.sqrt(clusterKeys.length))),
      clusterKeys.length,
    );

    // Distribute clusters into columns round-robin in natural order
    const columns = Array.from({ length: numCols }, () => []);
    clusterKeys.forEach((key, i) => {
      columns[i % numCols].push(key);
    });

    // Assign XY offsets: columns side by side on X, items stacked on Y within each column
    const clusterOffsets = {};

    // First pass: compute each column's width (widest sphere in it) and total height
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

    // Second pass: place each cluster
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

    // Per-cluster sphere positions
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
