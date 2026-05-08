import Select from "./ux/Select";
import { useI18n } from "../../contexts/I18nContext";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";

const ControlItem = ({ control, value, onChange }) => {
  const { t } = useI18n();
  const {
    id,
    type,
    label,
    min,
    max,
    step,
    options,
    isVisualOnly,
    isDesktopOnly,
  } = control;

  const isMobile = useMediaQuery();
  if (isMobile && isDesktopOnly) return null;

  const handleChange = (newValue) => {
    const processedValue = type === "range" ? parseFloat(newValue) : newValue;
    onChange(processedValue);
  };

  const ariaLabel = isVisualOnly
    ? `${label} (${t("menu.isVisualOnly")})`
    : undefined;

  switch (type) {
    case "checkbox":
      return (
        <div className="control-item checkbox-control">
          <label aria-label={ariaLabel}>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleChange(e.target.checked)}
            />
            <span>{label}</span>
          </label>
        </div>
      );

    case "color":
      return (
        <div className="control-item">
          <label aria-label={ariaLabel}>{label}</label>
          <input
            type="color"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
      );

    case "range":
      return (
        <div className="control-item range-control">
          <label aria-label={ariaLabel}>
            <span>{label}</span>
            <span>{value}</span>
          </label>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
      );

    case "select":
      return (
        <div className="control-item">
          <label aria-label={ariaLabel}>{label}</label>
          <Select
            options={options}
            value={value}
            onChange={onChange}
            label={ariaLabel || label}
          />
        </div>
      );

    case "radio":
      return (
        <div className="control-item radio-control">
          <fieldset>
            <legend aria-label={ariaLabel}>{label}</legend>
            <div className="radio-group">
              {options.map(({ value: optVal, label: optLabel }) => (
                <label key={optVal} className="radio-option">
                  <input
                    type="radio"
                    name={id}
                    value={optVal}
                    checked={value === optVal}
                    onChange={(e) => handleChange(e.target.value)}
                  />
                  <span>{optLabel}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      );

    default:
      return null;
  }
};

export default ControlItem;
