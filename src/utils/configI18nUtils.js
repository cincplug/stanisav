import { translate, getLocalizedLineageLabel } from "../i18n/runtime";

export const toI18nKeySegment = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const getControlGroupLabel = (groupName) =>
  translate(`controls.groups.${toI18nKeySegment(groupName)}`);

export const getControlLabel = (controlId) =>
  translate(`controls.${controlId}.label`);

export const getControlOptionLabel = (controlId, optionValue) =>
  translate(`controls.${controlId}.options.${toI18nKeySegment(optionValue)}`);

export const localizeControlConfig = (controlId, config) => ({
  ...config,
  group: getControlGroupLabel(config.group),
  label: getControlLabel(controlId),
  options: Array.isArray(config.options)
    ? config.options.map((option) => ({
        ...option,
        label: getControlOptionLabel(controlId, option.value),
      }))
    : config.options,
});

export const getFamilyLabel = (familyName) =>
  getLocalizedLineageLabel(familyName);
