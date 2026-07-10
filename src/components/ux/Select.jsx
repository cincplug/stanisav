import { cloneElement, isValidElement } from "react";
import { ExpandIcon } from "../Icons";
import "./Select.css";

/**
 * Select – native select styled to match app buttons.
 *
 * Props:
 *   options         – [{ value, label }]
 *   value           – currently selected value
 *   onChange        – (value: string) => void
 *   label           – accessible name for the select
 *   className       – optional extra class (e.g. "select-compact" for square compact menu variant)
 */
export default function Select({
  options,
  value,
  onChange,
  label,
  className,
  isCompact,
  icon,
}) {
  const wrapperClasses = [
    "select-wrapper",
    isCompact ? "select-wrapper-compact" : "",
    icon ? "select-wrapper-with-icon" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const selectClasses = [
    "select-native",
    className,
    isCompact ? "select-native-compact" : "",
    isCompact && icon ? "select-native-icon-only" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const overlayIcon =
    icon && isValidElement(icon)
      ? cloneElement(icon, {
          className: ["select-overlay-icon", icon.props?.className]
            .filter(Boolean)
            .join(" "),
        })
      : null;

  return (
    <div className={wrapperClasses}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={selectClasses}
      >
        {options.map(({ value: val, label }) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
      {overlayIcon}
      {!isCompact && !icon && <ExpandIcon className="expand-icon" />}
    </div>
  );
}
