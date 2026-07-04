import { resolveControlBounds } from "../../utils/configUtils";
import { formatCamelCase } from "../../utils/stringUtils.js";
import Range from "../ux/Range.jsx";
import Select from "../ux/Select";

// control shape: { dotKey, type, label, options, value }
// type and options are inferred upstream by inferControlType
const ControlItem = ({
  control,
  onChange,
  groupIndex = 0,
  controlIndex = 0,
}) => {
  const { dotKey, type, label: rawLabel, options, value } = control;
  const label = formatCamelCase(rawLabel);

  const handleChange = (newValue) => {
    const processedValue = type === "range" ? parseFloat(newValue) : newValue;
    onChange(processedValue);
  };

  switch (type) {
    case "checkbox":
      return (
        <div className={`control-item ${type}-control ${dotKey}`}>
          <label>
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
        <div className={`control-item ${type}-control ${dotKey}`}>
          <label>{label}</label>
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
            <span>{label}</span>
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
          <label>{label}</label>
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

export default ControlItem;
