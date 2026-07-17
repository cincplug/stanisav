import { getLocalizedLineageLabel, translate } from "../i18n/runtime";

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

export const getSortByLabel = (sortBy) =>
  getControlOptionLabel("sortBy", sortBy);
