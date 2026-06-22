import { Vector3 } from "three";
import { getSpeakerGroup } from "../utils/groupingUtils";
import { getLanguageLabel } from "../utils/linguisticUtils";
import {
  comparePath,
  getLineagePathForKey,
  sortLanguages,
} from "../utils/sortingUtils";

const spiralAxisConfig = {
  x: {
    buildPoint: (cos, u, v) => new Vector3(cos, u, v),
    poleOf: (p) => p.x,
    equatorialOf: (p) => [p.y, p.z],
  },
  y: {
    buildPoint: (cos, u, v) => new Vector3(u, cos, v),
    poleOf: (p) => p.y,
    equatorialOf: (p) => [p.x, p.z],
  },
  z: {
    buildPoint: (cos, u, v) => new Vector3(u, v, cos),
    poleOf: (p) => p.z,
    equatorialOf: (p) => [p.x, p.y],
  },
};

class LayoutEngine {
  constructor() {
    this.algorithms = {
      "sphere-layout": this.sphereLayout.bind(this),
    };
    this.currentAlgorithm = "sphere-layout";
  }

  calculateLayout(data, config = {}, algorithm = null) {
    const algo = algorithm || this.currentAlgorithm;
    if (!this.algorithms[algo]) {
      console.warn(`Unknown algorithm: ${algo}, falling back to sphere-layout`);
      return this.algorithms["sphere-layout"](data, config);
    }
    return this.algorithms[algo](data, config);
  }

  sphereLayout(data, config = {}) {
    const { languageData, languageLineages, speakerData, typologicalFeatures } =
      data;
    const { sortBy, labelContent, isReverse, isSegmented } = config.header;
    const { entranceAxis } = config.entrance;
    const { gap, cellSpacing, cellSizeModifier } = config.segmentation;
    const { spiralRatio, spiralAxis, sphereRadius } = config.scene;

    const { buildPoint } = spiralAxisConfig[spiralAxis] ?? spiralAxisConfig.y;
    const { poleOf: entrancePoleOf, equatorialOf: entranceEquatorialOf } =
      spiralAxisConfig[entranceAxis] ?? spiralAxisConfig[spiralAxis];

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
        spiralRatio,
        buildPoint,
      ),
      { poleOf: entrancePoleOf, equatorialOf: entranceEquatorialOf },
    );

    const basePoints = this.rotatePointsToFrontFacingAnchor(angularBasePoints);
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

    const clusterKeys =
      sortBy === "family"
        ? Object.keys(clusters).sort((a, b) =>
            comparePath(getLineagePathForKey(a), getLineagePathForKey(b)),
          )
        : Object.keys(clusters);

    const nodeSpacing = Math.sqrt(
      (4 * Math.PI * sphereRadius ** 2) / sortedLanguages.length,
    );
    const cellSize = nodeSpacing * cellSizeModifier;
    const clusterPadding = cellSize * gap;

    // --- Cluster dimensions in cell units ---
    const clusterDims = {};
    clusterKeys.forEach((key) => {
      const n = clusters[key].length;
      const cols = Math.ceil(Math.sqrt(n));
      const rows = Math.ceil(n / cols);
      clusterDims[key] = { cols, rows };
    });

    // --- Cluster bounding boxes using estimated label widths ---
    const clusterWidths = {};
    const clusterHeights = {};
    clusterKeys.forEach((key) => {
      const { cols, rows } = clusterDims[key];
      const members = clusters[key];
      let maxRowWidth = 0;
      for (let row = 0; row < rows; row++) {
        const rowMembers = members.slice(row * cols, (row + 1) * cols);
        const rowWidth = rowMembers.reduce((sum, code) => {
          const text = getLanguageLabel(code, languageData, labelContent);
          return sum + this.estimateLabelWidth(text, cellSize, cellSpacing);
        }, 0);
        if (rowWidth > maxRowWidth) maxRowWidth = rowWidth;
      }
      clusterWidths[key] = maxRowWidth;
      clusterHeights[key] = rows * cellSize;
    });

    // --- Pack clusters into a balanced grid of columns ---
    const numClusterCols = Math.min(
      Math.max(1, Math.round(Math.sqrt(clusterKeys.length))),
      clusterKeys.length,
    );

    const columnHeights = new Array(numClusterCols).fill(0);
    const clusterColumns = Array.from({ length: numClusterCols }, () => []);

    clusterKeys.forEach((key) => {
      const shortestCol = columnHeights.indexOf(Math.min(...columnHeights));
      clusterColumns[shortestCol].push(key);
      columnHeights[shortestCol] += clusterHeights[key] + clusterPadding;
    });

    const colWidths = clusterColumns.map((col) =>
      col.length > 0 ? Math.max(...col.map((key) => clusterWidths[key])) : 0,
    );
    const colHeights = clusterColumns.map((col) =>
      col.reduce(
        (sum, key, i) =>
          sum + clusterHeights[key] + (i > 0 ? clusterPadding : 0),
        0,
      ),
    );

    const totalWidth = colWidths.reduce(
      (sum, w, i) => sum + w + (i > 0 ? clusterPadding : 0),
      0,
    );
    const totalHeight = Math.max(...colHeights);

    const clusterOffsets = {};
    let cursorX = -totalWidth / 2;
    clusterColumns.forEach((col, colIndex) => {
      const colWidth = colWidths[colIndex];
      const colCenterX = cursorX + colWidth / 2;

      let cursorY = totalHeight / 2;
      col.forEach((key, rowIndex) => {
        const h = clusterHeights[key];
        if (rowIndex > 0) cursorY -= clusterPadding;
        cursorY -= h / 2;
        clusterOffsets[key] = new Vector3(colCenterX, cursorY, 0);
        cursorY -= h / 2;
      });

      cursorX += colWidth + clusterPadding;
    });

    // --- Place labels within each cluster using variable-width grid ---
    const clusteredPositions = {};
    clusterKeys.forEach((key) => {
      const offset = clusterOffsets[key];
      const members = clusters[key];
      const labelWidths = members.map((code) => {
        const text = getLanguageLabel(code, languageData, labelContent);
        return this.estimateLabelWidth(text, cellSize, cellSpacing);
      });
      const localPoints = this.generateVariableWidthGrid(
        members.length,
        labelWidths,
        cellSize,
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

  estimateLabelWidth(text, cellSize, cellSpacing) {
    return text.length * cellSize * cellSpacing;
  }

  generateFibonacciSphere(numPoints, radius, spiralRatio, buildPoint) {
    const points = [];
    const notNecessarilyGoldenRatio = Math.sqrt(spiralRatio) + 1;
    const angleIncrement = Math.PI * 2 * notNecessarilyGoldenRatio;
    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;
      const sin = radius * Math.sin(inclination);
      const cos = radius * Math.cos(inclination);
      const u = sin * Math.cos(azimuth);
      const v = sin * Math.sin(azimuth);
      const point = buildPoint(cos, u, v);
      points.push(point);
    }
    return points;
  }

  generateVariableWidthGrid(numPoints, labelWidths, cellSize) {
    const cols = Math.ceil(Math.sqrt(numPoints));
    const rows = Math.ceil(numPoints / cols);
    const rowHeight = cellSize;
    const stagger = cellSize / 2;
    const points = [];

    for (let row = 0; row < rows; row++) {
      const rowStart = row * cols;
      const rowEnd = Math.min(rowStart + cols, numPoints);
      const rowWidths = labelWidths.slice(rowStart, rowEnd);

      let cursor = 0;
      const rowXPositions = rowWidths.map((w) => {
        const x = cursor + w / 2;
        cursor += w;
        return x;
      });
      const rowTotalWidth = cursor;
      const rowOffsetX = -rowTotalWidth / 2;

      rowWidths.forEach((_, colInRow) => {
        const x = rowOffsetX + rowXPositions[colInRow];
        const y =
          -(row - (rows - 1) / 2) * rowHeight +
          (colInRow % 2 === 0 ? 0 : -stagger);
        points.push(new Vector3(x, y, 0));
      });
    }

    return points;
  }

  generateRectangularGrid(numPoints, cellSize) {
    const cols = Math.ceil(Math.sqrt(numPoints));
    const rows = Math.ceil(numPoints / cols);
    const stagger = cellSize / 2;
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = (col - (cols - 1) / 2) * cellSize;
      const y =
        (row - (rows - 1) / 2) * cellSize + (col % 2 === 0 ? 0 : -stagger);
      points.push(new Vector3(x, y, 0));
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

  sortSpherePointsByAngle(points, spiralAxisConfig) {
    const bandCount = Math.round(Math.sqrt(points.length));

    const lat = (p) => {
      const [e0, e1] = spiralAxisConfig.equatorialOf(p);
      return Math.atan2(
        Math.sqrt(e0 ** 2 + e1 ** 2),
        spiralAxisConfig.poleOf(p),
      );
    };
    const lon = (p) => {
      const [e0, e1] = spiralAxisConfig.equatorialOf(p);
      return Math.atan2(e1, e0);
    };

    return [...points].sort((a, b) => {
      const latA = lat(a);
      const latB = lat(b);
      const bandA = Math.floor((latA / Math.PI) * bandCount);
      const bandB = Math.floor((latB / Math.PI) * bandCount);

      if (bandA !== bandB) return bandA - bandB;

      const lonA = lon(a);
      const lonB = lon(b);
      return bandA % 2 === 0 ? lonA - lonB : lonB - lonA;
    });
  }
}

export { LayoutEngine };
