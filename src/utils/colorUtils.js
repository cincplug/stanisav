import { converter, formatHex } from "culori";
import lineages from "../config/lineages.json";

const toOklch = converter("oklch");

const oklchToHex = ({ l, c, h }) =>
  formatHex({
    mode: "oklch",
    l,
    c,
    h,
  });

export const shiftHue = (color, shift) => {
  const parsed = toOklch(color);
  return oklchToHex({
    l: parsed.l,
    c: parsed.c,
    h: parsed.h + shift,
  });
};

export const calculateLanguageColors = (
  languageData,
  languageLineages,
  colorConfig,
) => {
  const {
    hueStart,
    hueCircle,
    maxSiblingSpread,
    globalLightnessScale,
    globalLightnessOffset,
    globalChromaScale,
    globalChromaOffset,
  } = colorConfig;

  const result = {};
  const buckets = {};

  const nodeChildren = new Map();
  const nodeFirstSeen = new Map();
  const ownLanguageCount = new Map();
  const rootsSet = new Set();

  const languageCodes = Object.keys(languageData);

  const touchNode = (node, seenIndex) => {
    if (!nodeChildren.has(node)) nodeChildren.set(node, new Set());
    if (!nodeFirstSeen.has(node) || seenIndex < nodeFirstSeen.get(node)) {
      nodeFirstSeen.set(node, seenIndex);
    }
  };

  languageCodes.forEach((code, seenIndex) => {
    const lineageKey = languageLineages[code];

    if (!buckets[lineageKey]) buckets[lineageKey] = [];
    buckets[lineageKey].push(code);

    ownLanguageCount.set(
      lineageKey,
      (ownLanguageCount.get(lineageKey) ?? 0) + 1,
    );

    const ancestors = lineages?.[lineageKey];
    const path = [...ancestors, lineageKey];
    if (path.length > 0) rootsSet.add(path[0]);

    path.forEach((node, depth) => {
      touchNode(node, seenIndex);
      if (depth === 0) return;
      const parent = path[depth - 1];
      nodeChildren.get(parent).add(node);
    });
  });

  const byFirstSeen = (a, b) => nodeFirstSeen.get(a) - nodeFirstSeen.get(b);

  const subtreeMemo = new Map();
  const getSubtreeWeight = (node) => {
    if (subtreeMemo.has(node)) return subtreeMemo.get(node);

    let total = ownLanguageCount.get(node) ?? 0;
    const children = [...nodeChildren.get(node)];
    children.forEach((child) => {
      total += getSubtreeWeight(child);
    });

    subtreeMemo.set(node, total);
    return total;
  };

  const roots = [...rootsSet].sort(byFirstSeen);

  const nodeHue = new Map();

  const assignRanges = (nodes, start, end) => {
    const span = end - start;
    const totalWeight = nodes.reduce(
      (sum, node) => sum + getSubtreeWeight(node),
      0,
    );

    let cursor = start;
    nodes.forEach((node) => {
      const weight = getSubtreeWeight(node);
      const nodeSpan = (span * weight) / totalWeight;
      const center = cursor + nodeSpan / 2;

      nodeHue.set(node, center);

      const children = [...nodeChildren.get(node)].sort(byFirstSeen);
      if (children.length > 0)
        assignRanges(children, cursor, cursor + nodeSpan);

      cursor += nodeSpan;
    });
  };

  assignRanges(roots, hueStart, hueStart + hueCircle);

  languageCodes.forEach((code) => {
    const lineageKey = languageLineages[code];
    const siblings = buckets[lineageKey];
    const index = siblings.indexOf(code);

    const spread =
      siblings.length > 1
        ? (index / (siblings.length - 1) - 0.5) * maxSiblingSpread
        : 0;

    const ancestors = lineages?.[lineageKey] ?? [];
    const depth = ancestors.length;

    const rawL = 0.8 - depth * 0.02;
    const rawC = 0.2 - depth * 0.01;

    const l = rawL * globalLightnessScale + globalLightnessOffset;
    const c = rawC * globalChromaScale + globalChromaOffset;

    result[code] = oklchToHex({
      l,
      c,
      h: nodeHue.get(lineageKey) + spread,
    });
  });

  return result;
};
