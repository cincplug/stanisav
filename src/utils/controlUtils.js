import guiConfig from "../config/guiConfig.json";

export const getControlValue = (controlId, groupName, state) => {
  const control = guiConfig[controlId];
  if (!control || control.group !== groupName) return undefined;
  return state[groupName]?.[controlId];
};

export const setControlValue = (controlId, groupName, value, setState) => {
  const control = guiConfig[controlId];
  if (!control || control.group !== groupName) return;
  const handler = setState[groupName];
  if (handler) handler(controlId, value);
};

export const getDisplayValue = (controlId, groupName, state) => {
  const control = guiConfig[controlId];
  if (!control || control.group !== groupName) return "";
  const { type, label } = control;
  const value = getControlValue(controlId, groupName, state);

  if (type === "range") {
    if (label.includes("Duration") || label.includes("Delay"))
      return `${value}`;
    if (controlId === "easingPower") return value.toFixed(1);
    if (typeof value === "number") return value.toFixed(2);
  }

  return value?.toString() || "";
};
