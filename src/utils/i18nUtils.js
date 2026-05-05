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
    ? config.options.map((value) =>
        typeof value === "string"
          ? { value, label: getControlOptionLabel(controlId, value) }
          : { ...value, label: getControlOptionLabel(controlId, value.value) },
      )
    : config.options,
});

export const getFamilyLabel = (familyName) =>
  getLocalizedLineageLabel(familyName);
