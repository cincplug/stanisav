import { resolveControlBounds } from "../../utils/configUtils";
import { formatCamelCase } from "../../utils/stringUtils.js";
import { RefreshIcon } from "../Icons.jsx";
import Range from "../ux/Range.jsx";
import Select from "../ux/Select.jsx";
import { useConfigContext } from "../../contexts/ConfigContext.jsx";

// control shape: { dotKey, type, label, options, value, isChanged }
// type and options are inferred upstream by inferControlType
const ControlItem = ({
  control,
  onChange,
  onReset,
  groupIndex = 0,
  controlIndex = 0,
}) => {
  const { dotKey, type, label: rawLabel, options, value, isChanged } = control;
  const { config } = useConfigContext();
  const { usesCamelCase } = config;
  const label = usesCamelCase ? rawLabel : formatCamelCase(rawLabel);

  const handleChange = (newValue) => {
    const processedValue = type === "range" ? parseFloat(newValue) : newValue;
    onChange(processedValue);
  };

  switch (type) {
    case "checkbox":
      return (
        <div className={`control-item ${type}-control ${dotKey}`}>
          <div className="label-wrap">
            <input
              id={dotKey}
              type="checkbox"
              checked={value}
              onChange={(e) => handleChange(e.target.checked)}
            />
            <label htmlFor={dotKey}>
              <span>{label}</span>
            </label>
            <ResetButton
              isChanged={isChanged}
              label={label}
              onReset={onReset}
            />
          </div>
        </div>
      );

    case "color":
      return (
        <div className={`control-item ${type}-control ${dotKey}`}>
          <div className="label-wrap">
            <label>{label}</label>
            <ResetButton
              isChanged={isChanged}
              label={label}
              onReset={onReset}
            />
          </div>

          <input
            type="color"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
      );

    case "range": {
      const { min, max, step } = resolveControlBounds(dotKey);
      return (
        <div className={`control-item ${type}-control ${dotKey}`}>
          <label>
            <div className="label-wrap">
              <span>{label}</span>
              <ResetButton
                isChanged={isChanged}
                label={label}
                onReset={onReset}
              />
            </div>
            <span>{value}</span>
          </label>

          <Range
            style={{ "--i": groupIndex * controlIndex }}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
      );
    }

    case "select":
      return (
        <div className={`control-item ${type}-control ${dotKey}`}>
          <div className="label-wrap">
            <label>{label}</label>
            <ResetButton
              isChanged={isChanged}
              label={label}
              onReset={onReset}
            />
          </div>
          <Select
            options={options}
            value={value}
            onChange={onChange}
            label={label}
          />
        </div>
      );

    default:
      return null;
  }
};

const ResetButton = ({ isChanged, label, onReset }) => {
  if (!isChanged) return null;
  return (
    <button
      type="button"
      className="reset-button"
      onClick={onReset}
      aria-label={`Reset ${label}`}
    >
      <RefreshIcon className="reset-icon" />
    </button>
  );
};

export default ControlItem;
