import Select from "./ux/Select";

const ControlItem = ({ control, value, onChange }) => {
  const { id, type, label, min, max, step, options } = control;

  const handleChange = (newValue) => {
    const processedValue = type === "range" ? parseFloat(newValue) : newValue;
    onChange(processedValue);
  };

  switch (type) {
    case "checkbox":
      return (
        <div className="control-item checkbox-control">
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
        <div className="control-item">
          <label>{label}</label>
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
          <label>
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
        <Select
          options={options}
          value={value}
          onChange={onChange}
          label={label}
        />
      );

    case "radio":
      return (
        <div className="control-item radio-control">
          <fieldset>
            <legend>{label}</legend>
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
