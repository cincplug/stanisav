import { Vector3 } from "three";
import { getSpeakerGroup } from "../utils/groupingUtils";
import { getLanguageLabel } from "../utils/linguisticUtils";
import { comparePath, getLineagePathForKey } from "../utils/sortingUtils";

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

// ---------------------------------------------------------------------------
// Geometry primitives
// ---------------------------------------------------------------------------

function generateFibonacciSphere(numPoints, radius, spiralRatio, buildPoint) {
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
    points.push(buildPoint(cos, u, v));
  }
  return points;
}

function sortSpherePointsByAngle(points, axisConfig) {
  const bandCount = Math.round(Math.sqrt(points.length));

  const lat = (p) => {
    const [e0, e1] = axisConfig.equatorialOf(p);
    return Math.atan2(Math.sqrt(e0 ** 2 + e1 ** 2), axisConfig.poleOf(p));
  };
  const lon = (p) => {
    const [e0, e1] = axisConfig.equatorialOf(p);
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

function rotatePointsToFrontFacingAnchor(points) {
  if (points.length <= 1) return points;

  let bestIndex = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < points.length; i++) {
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

function estimateLabelWidth(text, labelSize, charWidthRatio, labelPaddingH) {
  return text.length * labelSize * charWidthRatio + labelPaddingH * labelSize;
}

function generateFlowLayout(
  numPoints,
  labelWidths,
  rowHeight,
  areClusterRowsAlternating,
) {
  if (numPoints === 0) return { points: [], actualWidth: 0, actualHeight: 0 };

  const totalWidth = labelWidths.reduce((s, w) => s + w, 0);
  const targetRowWidth = totalWidth / Math.ceil(Math.sqrt(numPoints));

  const rows = [];
  let currentRow = [];
  let currentRowWidth = 0;

  for (let i = 0; i < numPoints; i++) {
    const w = labelWidths[i];
    if (currentRow.length > 0 && currentRowWidth + w > targetRowWidth) {
      rows.push({ items: currentRow, width: currentRowWidth });
      currentRow = [{ index: i, width: w }];
      currentRowWidth = w;
    } else {
      currentRow.push({ index: i, width: w });
      currentRowWidth += w;
    }
  }
  if (currentRow.length > 0)
    rows.push({ items: currentRow, width: currentRowWidth });

  const actualWidth = Math.max(...rows.map((r) => r.width));
  const actualHeight = rows.length * rowHeight;

  const points = new Array(numPoints);
  rows.forEach((row, rowIndex) => {
    // Every second row flows right-to-left instead of left-to-right, so the
    // path from one label to the next stays short and the connecting lines
    // don't have to snap back across the full row width. Items are still
    // wrapped into rows the same way; only their x position within the row
    // is mirrored, so row widths/breakpoints are unaffected.
    const isRowReversed = areClusterRowsAlternating && rowIndex % 2 === 1;

    let cursor = -row.width / 2;
    row.items.forEach((item) => {
      const x = cursor + item.width / 2;
      const y = -(rowIndex - (rows.length - 1) / 2) * rowHeight;
      points[item.index] = new Vector3(isRowReversed ? -x : x, y, 0);
      cursor += item.width;
    });
  });

  return { points, actualWidth, actualHeight };
}

export function generateRectangularGrid(numPoints, cellSize) {
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

export function reorderBySpatialProximity(points, options = {}) {
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
    for (let i = 1; i < searchLimit; i++) {
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

// ---------------------------------------------------------------------------
// Sphere base positions — Fibonacci sphere, one point per language
// ---------------------------------------------------------------------------

function computeSphereBasePositions(sortedLanguageCodes, config) {
  const { spiralRatio, spiralAxis, entranceAxis, sphereRadius } = config;

  const { buildPoint } = spiralAxisConfig[spiralAxis] ?? spiralAxisConfig.y;
  const { poleOf: entrancePoleOf, equatorialOf: entranceEquatorialOf } =
    spiralAxisConfig[entranceAxis] ?? spiralAxisConfig[spiralAxis];

  const rawPoints = generateFibonacciSphere(
    sortedLanguageCodes.length,
    sphereRadius,
    spiralRatio,
    buildPoint,
  );
  const angularPoints = sortSpherePointsByAngle(rawPoints, {
    poleOf: entrancePoleOf,
    equatorialOf: entranceEquatorialOf,
  });
  const points = rotatePointsToFrontFacingAnchor(angularPoints);

  const positions = {};
  sortedLanguageCodes.forEach((code, i) => {
    positions[code] = points[i];
  });
  return positions;
}

// ---------------------------------------------------------------------------
// Board positions — languages grouped into clusters, laid out on a flat grid
// ---------------------------------------------------------------------------

function getClusterKey(code, languageData, languageLineages, config) {
  const { sortBy, labelContent, isBlackboard } = config;
  switch (sortBy) {
    case "speakers":
      return isBlackboard
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
}

function computeBoardPositions(
  sortedLanguageCodes,
  languageData,
  languageLineages,
  config,
) {
  const {
    sortBy,
    labelContent,
    labelSize,
    charWidthRatio,
    labelPaddingH,
    rowHeightRatio,
    clusterGap,
    boardWidth,
    areClusterRowsAlternating,
  } = config;

  const rowHeight = labelSize * rowHeightRatio;
  const clusterPadding = labelSize * clusterGap;

  const clusters = {};
  sortedLanguageCodes.forEach((code) => {
    const key = getClusterKey(code, languageData, languageLineages, config);
    if (!clusters[key]) clusters[key] = [];
    clusters[key].push(code);
  });

  const clusterKeys =
    sortBy === "family"
      ? Object.keys(clusters).sort((a, b) =>
          comparePath(getLineagePathForKey(a), getLineagePathForKey(b)),
        )
      : Object.keys(clusters);

  const clusterLayouts = {};
  clusterKeys.forEach((key) => {
    const members = clusters[key];
    const labelWidths = members.map((code) => {
      const text = getLanguageLabel(code, languageData, labelContent);
      return estimateLabelWidth(text, labelSize, charWidthRatio, labelPaddingH);
    });
    clusterLayouts[key] = generateFlowLayout(
      members.length,
      labelWidths,
      rowHeight,
      areClusterRowsAlternating,
    );
  });

  const clusterWidths = {};
  const clusterHeights = {};
  clusterKeys.forEach((key) => {
    clusterWidths[key] = clusterLayouts[key].actualWidth;
    clusterHeights[key] = clusterLayouts[key].actualHeight;
  });

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
      (sum, key, i) => sum + clusterHeights[key] + (i > 0 ? clusterPadding : 0),
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

  // Uniformly scale the whole horizontal axis - both the spacing between
  // clusters (offsets) and each cluster's own width (local points) - so the
  // board always fits boardWidth without clusters ever overlapping. Scaling
  // only the offsets kept clusters at full size while pulling their centers
  // together, so adjacent clusters overlapped whenever the available board
  // width shrank, e.g. the side menu opening.
  const scaleX = totalWidth > 0 && boardWidth > 0 ? boardWidth / totalWidth : 1;

  const positions = {};
  clusterKeys.forEach((key) => {
    const offset = clusterOffsets[key];
    const members = clusters[key];
    const localPoints = clusterLayouts[key].points;
    members.forEach((code, j) => {
      const localPoint = localPoints[j];
      positions[code] = new Vector3(
        (offset.x + localPoint.x) * scaleX,
        offset.y + localPoint.y,
        offset.z + localPoint.z,
      );
    });
  });

  return positions;
}

// ---------------------------------------------------------------------------
// Main export — computes positions for both sphere and board modes.
// Caller provides pre-sorted language codes (from useSortedLanguages).
// t = 0 → pure sphere layout; t = 1 → pure board (blackboard) layout.
// ---------------------------------------------------------------------------

export function calculatePositions({
  sortedLanguageCodes,
  languageData,
  languageLineages,
  config,
}) {
  if (sortedLanguageCodes.length === 0) return {};

  const { isBlackboard } = config;

  const spherePositions = computeSphereBasePositions(
    sortedLanguageCodes,
    config,
  );
  const boardPositions = computeBoardPositions(
    sortedLanguageCodes,
    languageData,
    languageLineages,
    config,
  );

  const t = isBlackboard ? 1 : 0;

  const positions = {};
  sortedLanguageCodes.forEach((code) => {
    positions[code] = spherePositions[code]
      .clone()
      .lerp(boardPositions[code], t);
  });
  return positions;
}
