import { converter, formatHex } from "culori";
import lineages from "../config/lineages.json";
import { config } from "../modules/configStore";

const toOklch = converter("oklch");
const oklchToHex = ({ l, c, h }) => formatHex({ mode: "oklch", l, c, h });

export const shiftHue = (color, shift) => {
  const parsed = toOklch(color);
  return oklchToHex({ l: parsed.l, c: parsed.c, h: parsed.h + shift });
};

export const calculateLanguageColors = (
  languageData,
  languageLineages,
  controls,
) => {
  const {
    hue,
    lightness,
    saturation,
  } = controls;

  const { hueCircle, maxSiblingSpread } = config.colors;

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
      nodeChildren.get(path[depth - 1]).add(node);
    });
  });

  const byFirstSeen = (a, b) => nodeFirstSeen.get(a) - nodeFirstSeen.get(b);

  const subtreeMemo = new Map();
  const getSubtreeWeight = (node) => {
    if (subtreeMemo.has(node)) return subtreeMemo.get(node);
    let total = ownLanguageCount.get(node) ?? 0;
    [...nodeChildren.get(node)].forEach((child) => {
      total += getSubtreeWeight(child);
    });
    subtreeMemo.set(node, total);
    return total;
  };

  const roots = [...rootsSet].sort(byFirstSeen);
  const nodeHue = new Map();

  const assignHueRanges = (nodes, start, end) => {
    const span = end - start;
    const totalWeight = nodes.reduce(
      (sum, node) => sum + getSubtreeWeight(node),
      0,
    );
    let cursor = start;
    nodes.forEach((node) => {
      const weight = getSubtreeWeight(node);
      const nodeSpan = (span * weight) / totalWeight;
      nodeHue.set(node, cursor + nodeSpan / 2);
      const children = [...nodeChildren.get(node)].sort(byFirstSeen);
      if (children.length > 0)
        assignHueRanges(children, cursor, cursor + nodeSpan);
      cursor += nodeSpan;
    });
  };

  assignHueRanges(roots, hue, hue + hueCircle);

  languageCodes.forEach((code) => {
    const lineageKey = languageLineages[code];
    const siblings = buckets[lineageKey];
    const index = siblings.indexOf(code);
    const siblingOffset =
      siblings.length > 1
        ? (index / (siblings.length - 1) - 0.5) * maxSiblingSpread
        : 0;

    const depth = (lineages?.[lineageKey] ?? []).length;

    const l = lightness - depth / 100;
    const c = saturation - depth / 100;

    result[code] = oklchToHex({
      l,
      c,
      h: nodeHue.get(lineageKey) + siblingOffset,
    });
  });

  return result;
};
