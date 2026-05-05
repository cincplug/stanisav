import { translate, getLocalizedLineageLabel } from "../i18n/runtime";

const toGroupKey = (groupName) => {
  const words = String(groupName)
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);

  if (words.length === 0) {
    throw new Error(`Invalid control group '${groupName}'`);
  }

  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      return index === 0
        ? lower
        : `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    })
    .join("");
};

export const getControlGroupLabel = (groupName) =>
  translate(`controls.groups.${toGroupKey(groupName)}`);

export const getControlLabel = (controlId) =>
  translate(`controls.${controlId}.label`);

export const getControlOptionLabel = (controlId, optionValue) =>
  translate(`controls.${controlId}.options.${optionValue}`);

export const localizeControlConfig = (controlId, config) => ({
  ...config,
  label: getControlLabel(controlId),
  options: Array.isArray(config.options)
    ? config.options.map((value) => {
        if (typeof value === "string") {
          return { value, label: getControlOptionLabel(controlId, value) };
        }
        if (typeof value === "number") {
          return { value, label: String(value) };
        }
        // already a {value, label} object
        return value;
      })
    : config.options,
});

export const getFamilyLabel = (familyName) =>
  getLocalizedLineageLabel(familyName);
