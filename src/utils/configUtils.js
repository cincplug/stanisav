import staticConfig from "../config/config.json";

export const deriveStep = (value) => {
  const abs = Math.abs(value);
  const str = String(abs);
  const decimalIndex = str.indexOf(".");
  const decimalPlaces = decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
  if (decimalPlaces >= 2) return 0.01;
  if (decimalPlaces === 1) return 0.1;
  return 1;
};

export const deriveMin = (value) => {
  const step = deriveStep(value);
  const raw = Math.abs(value / 5) - 1;
  return Math.round(raw / step) * step;
};

export const deriveMax = (value) => {
  const step = deriveStep(value);
  const raw = Math.abs(value * 5) + 1;
  return Math.round(raw / step) * step;
};

// Reads a dot-notation key from a nested object
const readDotKey = (dotKey, obj) => {
  const parts = dotKey.split(".");
  let target = obj;
  for (const part of parts) {
    if (target === null || typeof target !== "object") return undefined;
    target = target[part];
  }
  return target;
};

// Returns { min, max, step } for a dot-notation config key,
// deriving bounds from the static default value in config.json
export const resolveControlBounds = (dotKey) => {
  const staticDefault = readDotKey(dotKey, staticConfig);
  if (typeof staticDefault !== "number")
    return { min: -Infinity, max: Infinity, step: 1 };
  return {
    min: deriveMin(staticDefault),
    max: deriveMax(staticDefault),
    step: deriveStep(staticDefault),
  };
};

// Derives the control type and select options from a raw config.json value.
// Returns null for types we don't render (objects, null, undefined).
export const inferControlType = (value) => {
  if (Array.isArray(value)) return { type: "select", options: value };
  if (typeof value === "boolean") return { type: "checkbox", options: null };
  if (typeof value === "string" && value.startsWith("#"))
    return { type: "color", options: null };
  if (typeof value === "number") return { type: "range", options: null };
  return null;
};
