import { converter, formatHex } from "culori";
import lineages from "../config/lineages.json";

const toOklch = converter("oklch");

const invariant = (condition, message) => {
  if (!condition) throw new Error(message);
};

const hash = (str = "") => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const wrapHue = (h) => ((h % 360) + 360) % 360;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const getLineagePath = (lineageKey) => {
  const ancestors = lineages?.[lineageKey];
  invariant(
    Array.isArray(ancestors),
    `Missing lineage in lineages.json for key '${lineageKey}'`,
  );
  return [...ancestors, lineageKey];
};

const oklchToHex = ({ l, c, h }) =>
  formatHex({
    mode: "oklch",
    l: clamp(l, 0, 1),
    c: clamp(c, 0, 0.37),
    h: wrapHue(h),
  });

export const shiftHue = (color, shift = 0) => {
  const parsed = toOklch(color);
  invariant(!!parsed, `Invalid color '${color}'`);
  return oklchToHex({
    l: parsed.l ?? 0.62,
    c: parsed.c ?? 0.16,
    h: (parsed.h ?? 0) + shift,
  });
};

export const calculateLanguageColors = (languageData, languageLineages) => {
  const result = {};
  const buckets = {};

  Object.keys(languageData).forEach((code) => {
    const lineageKey = languageLineages[code];
    invariant(
      typeof lineageKey === "string" && lineageKey.length > 0,
      `Missing lineageKey for language '${code}'`,
    );
    if (!buckets[lineageKey]) buckets[lineageKey] = [];
    buckets[lineageKey].push(code);
  });

  Object.values(buckets).forEach((codes) => codes.sort());

  Object.keys(languageData).forEach((code) => {
    const lineageKey = languageLineages[code];
    const path = getLineagePath(lineageKey);

    const family = path[0];
    const level1 = path[1] || "";
    const level2 = path[2] || "";

    let h = hash(family) % 360;
    h += (hash(level1) % 41) - 20;
    h += (hash(level2) % 29) - 14;
    h += (hash(lineageKey) % 17) - 8;

    const idx = buckets[lineageKey].indexOf(code);
    const spread = ((idx * 137.508) % 24) - 12;

    const depth = path.length - 1;
    const l = 0.62 - depth * 0.02;
    const c = 0.19 - depth * 0.01;

    result[code] = oklchToHex({
      l,
      c,
      h: h + spread,
    });
  });

  return result;
};
