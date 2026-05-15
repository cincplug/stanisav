import Select from "./ux/Select";
import { useI18n } from "../../contexts/I18nContext";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import * as MenuIcons from "./MenuIcons";

const ControlItem = ({
  control,
  value,
  onChange,
  isCompact = false,
  groupIndex,
  controlIndex,
}) => {
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
    compactMenuIcon,
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

  // Compact mode: render an icon button or icon-toggled select.
  // Only reached when compactMenuIcon is present (ControlItemGroup filters for it).
  if (isCompact) {
    const Icon = MenuIcons[compactMenuIcon];

    if (type === "checkbox") {
      return (
        <button
          className={`menu-item${value ? " selected" : ""}`}
          onClick={() => handleChange(!value)}
          aria-label={ariaLabel || label}
          aria-pressed={value}
        >
          <Icon />
        </button>
      );
    }

    if (type === "select") {
      return (
        <Select
          options={options}
          value={value}
          onChange={onChange}
          label={ariaLabel || label}
          toggleContent={() => <Icon />}
          toggleClassName="menu-item"
        />
      );
    }

    return null;
  }

  // Full menu rendering
  switch (type) {
    case "checkbox":
      return (
        <div className={`control-item ${type}-control ${id}`}>
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
        <div className={`control-item ${type}-control ${id}`}>
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
        <div className={`control-item ${type}-control ${id}`}>
          <label aria-label={ariaLabel}>
            <span>{label}</span>
            <span>{value}</span>
          </label>
          <input
            style={{ "--i": groupIndex * controlIndex }}
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
        <div className={`control-item ${type}-control ${id}`}>
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
        <div className={`control-item ${type}-control ${id}`}>
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
