import { converter, formatHex } from "culori";
import lineages from "../config/lineages.json";

const toOklch = converter("oklch");

const wrapHue = (h) => ((h % 360) + 360) % 360;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const oklchToHex = ({ l, c, h }) =>
  formatHex({
    mode: "oklch",
    l: clamp(l, 0, 1),
    c: clamp(c, 0, 0.37),
    h: wrapHue(h),
  });

export const shiftHue = (color, shift = 0) => {
  const parsed = toOklch(color);
  return oklchToHex({
    l: parsed.l ?? 0.62,
    c: parsed.c ?? 0.16,
    h: (parsed.h ?? 0) + shift,
  });
};

export const calculateLanguageColors = (
  languageData,
  languageLineages,
  hueStart,
  hueCircle,
  maxSiblingSpread,
  globalLightnessScale,
  globalLightnessOffset,
  globalChromaScale,
  globalChromaOffset,
) => {
  const result = {};
  const buckets = {};

  const nodeChildren = new Map();
  const nodeDepth = new Map();
  const nodeFirstSeen = new Map();
  const ownLanguageCount = new Map();

  const languageCodes = Object.keys(languageData);

  const touchNode = (node, depth, seenIndex) => {
    if (!nodeChildren.has(node)) nodeChildren.set(node, new Set());
    if (!nodeDepth.has(node) || depth < nodeDepth.get(node))
      nodeDepth.set(node, depth);
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

    const ancestors = lineages?.[lineageKey] ?? [];
    const path = [...ancestors, lineageKey];

    path.forEach((node, depth) => {
      touchNode(node, depth, seenIndex);
      if (depth === 0) return;
      const parent = path[depth - 1];
      touchNode(parent, depth - 1, seenIndex);
      nodeChildren.get(parent).add(node);
    });
  });

  const byFirstSeen = (a, b) =>
    (nodeFirstSeen.get(a) ?? 0) - (nodeFirstSeen.get(b) ?? 0);

  const subtreeMemo = new Map();
  const getSubtreeWeight = (node) => {
    if (subtreeMemo.has(node)) return subtreeMemo.get(node);

    let total = ownLanguageCount.get(node) ?? 0;
    const children = [...(nodeChildren.get(node) ?? [])];
    children.forEach((child) => {
      total += getSubtreeWeight(child);
    });

    subtreeMemo.set(node, total);
    return total;
  };

  const roots = [...nodeDepth.entries()]
    .filter(([, depth]) => depth === 0)
    .map(([node]) => node)
    .sort(byFirstSeen);

  const nodeHue = new Map();

  const assignRanges = (nodes, start, end) => {
    const span = end - start;
    const totalWeight =
      nodes.reduce((sum, node) => sum + getSubtreeWeight(node), 0) || 1;

    let cursor = start;
    nodes.forEach((node) => {
      const weight = getSubtreeWeight(node);
      const nodeSpan = (span * weight) / totalWeight;
      const center = cursor + nodeSpan / 2;

      nodeHue.set(node, center);

      const children = [...(nodeChildren.get(node) ?? [])].sort(byFirstSeen);
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
      h: (nodeHue.get(lineageKey) ?? 0) + spread,
    });
  });

  return result;
};
