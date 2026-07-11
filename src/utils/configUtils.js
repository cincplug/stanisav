import staticConfig from "../config/config.json";
import controlsHideConfig from "../config/controlsHideConfig.json";

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
  const raw = Math.abs(value / 5) - 2;
  return Math.round(raw / step) * step;
};

export const deriveMax = (value) => {
  const step = deriveStep(value);
  const raw = Math.abs(value * 5) + 2;
  return Math.round(raw / step) * step;
};

// Reads a dot-notation key from a nested object
export const readDotKey = (dotKey, obj) => {
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

// True if every item in the array is the same primitive type - the shape
// expected for a config array to be treated as select options.
export const isSelectOptions = (arr) =>
  arr.length > 0 &&
  arr.every(
    (item) => typeof item === typeof arr[0] && typeof item !== "object",
  );

// Recursively resolves a raw config tree into its initial value shape:
// select-option arrays collapse to their first element, everything else is kept as-is.
export const resolveInitialValues = (obj) => {
  if (Array.isArray(obj)) return isSelectOptions(obj) ? obj[0] : obj;
  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, resolveInitialValues(v)]),
    );
  }
  return obj;
};

// Recursively flattens a nested config object into a single-level object.
// Select option arrays are collapsed to their first element; non-select arrays are kept as-is.
export const flattenConfig = (obj) => {
  const result = {};
  const traverse = (node) => {
    for (const [key, value] of Object.entries(node)) {
      if (Array.isArray(value)) {
        result[key] = isSelectOptions(value) ? value[0] : value;
      } else if (typeof value === "object" && value !== null) {
        traverse(value);
      } else {
        result[key] = value;
      }
    }
  };
  traverse(obj);
  return result;
};

// Flattens a group's raw config shape into [relativeDotKey, value] pairs.
// Non-select arrays are dropped, since they aren't rendered as controls.
export const flattenGroupEntries = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([key, value]) => {
    const relKey = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      return isSelectOptions(value) ? [[relKey, value]] : [];
    }
    if (typeof value === "object" && value !== null)
      return flattenGroupEntries(value, relKey);
    return [[relKey, value]];
  });

// Returns a new object with the value at dotKey replaced, without mutating the input.
export const setDotKey = (obj, dotKey, value) => {
  const [head, ...rest] = dotKey.split(".");
  if (rest.length === 0) return { ...obj, [head]: value };
  return { ...obj, [head]: setDotKey(obj[head] ?? {}, rest.join("."), value) };
};

// Resolves the static default for a dot key, collapsing select-option arrays to their first element.
export const resolveDefaultValue = (dotKey) => {
  const staticValue = readDotKey(dotKey, staticConfig);
  return Array.isArray(staticValue) && isSelectOptions(staticValue)
    ? staticValue[0]
    : staticValue;
};

// Arrays/objects are compared by content, everything else by reference/primitive equality.
export const areConfigValuesEqual = (valueA, valueB) => {
  if (Array.isArray(valueA) || Array.isArray(valueB)) {
    return JSON.stringify(valueA) === JSON.stringify(valueB);
  }
  return valueA === valueB;
};

// Deep-merges a stored/imported config into the default shape, so keys missing
// from an older or partial payload still fall back to their default.
export const mergeStoredConfig = (defaultNode, storedNode) => {
  if (storedNode === undefined) return defaultNode;
  if (Array.isArray(defaultNode)) {
    return Array.isArray(storedNode) ? storedNode : defaultNode;
  }
  if (typeof defaultNode === "object" && defaultNode !== null) {
    if (typeof storedNode !== "object" || storedNode === null)
      return defaultNode;
    const result = {};
    for (const [key, value] of Object.entries(defaultNode)) {
      result[key] = mergeStoredConfig(value, storedNode[key]);
    }
    return result;
  }
  return storedNode;
};

// Recursively keeps only the leaves that differ from the default config, so a saved
// preset captures just the design choices someone actually changed, nothing else.
export const diffFromDefaults = (defaultNode, currentNode) => {
  if (typeof defaultNode === "object" && defaultNode !== null) {
    const result = {};
    for (const [key, defaultValue] of Object.entries(defaultNode)) {
      const diffValue = diffFromDefaults(defaultValue, currentNode?.[key]);
      if (diffValue !== undefined) result[key] = diffValue;
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }
  return areConfigValuesEqual(defaultNode, currentNode)
    ? undefined
    : currentNode;
};

// Group names holding session/user state (e.g. sort order, menu-expanded) rather
// than design choices - excluded from presets, reset-all, and change detection.
export const ignoredGroupNames = Object.keys(controlsHideConfig).filter(
  (groupName) => controlsHideConfig[groupName]?.isAlwaysHidden,
);
