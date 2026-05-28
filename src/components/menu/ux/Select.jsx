import { ExpandIcon } from "../MenuIcons";
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
export default function Select({ options, value, onChange, label, className }) {
  return (
    <div className="select-wrapper">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={`select-native${className ? ` ${className}` : ""}`}
      >
        {options.map(({ value: val, label }) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
      <ExpandIcon className="expand-icon" />
    </div>
  );
}
