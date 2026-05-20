import { useRef } from "react";
import Popover from "./Popover";
import "./Range.css";

/**
 * Range – custom styled range input.
 *
 * Props (in addition to standard range input props: min, max, step, value, onChange, id, name):
 *   thumbIcon  – React component (SVG) or image URL string used as the thumb graphic
 *   budIcon    – React component (SVG) or image URL string rendered above the thumb (the "bud")
 *   className  – extra class on the wrapper
 *   label      – accessible label (if no external <label> is used)
 */
const RangeIcon = ({ icon }) => {
  if (!icon) return null;
  if (typeof icon === "string") {
    return <img src={icon} alt="" aria-hidden="true" className="range-icon" />;
  }
  const Icon = icon;
  return <Icon className="range-icon" aria-hidden="true" />;
};

const Range = ({
  min,
  max,
  step,
  value,
  onChange,
  id,
  name,
  thumbIcon,
  budIcon,
  tooltip,
  className,
  label,
  style,
  ...rest
}) => {
  const showOverlay = thumbIcon || budIcon;
  const popoverRef = useRef(null);

  const thumbPercent =
    min !== undefined && max !== undefined
      ? ((value - min) / (max - min)) * 100
      : 50;

  return (
    <div
      className={`range-wrapper${className ? ` ${className}` : ""}`}
      style={style}
    >
      {label && (
        <label htmlFor={id} className="range-label">
          {label}
        </label>
      )}
      <div className="range-track-area">
        <input
          type="range"
          id={id}
          name={name}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className={`range-input${showOverlay ? " range-input--has-overlay" : ""}`}
          onMouseEnter={
            tooltip ? () => popoverRef.current?.showPopover() : undefined
          }
          onMouseLeave={
            tooltip ? () => popoverRef.current?.hidePopover() : undefined
          }
          {...rest}
        />
        {showOverlay && (
          <div
            className="range-overlay"
            style={{ "--thumb-percent": `${thumbPercent}%` }}
            aria-hidden="true"
          >
            {budIcon && (
              <div className="range-bud">
                <RangeIcon icon={budIcon} />
              </div>
            )}
            {thumbIcon && (
              <div className="range-thumb-icon">
                <RangeIcon icon={thumbIcon} />
              </div>
            )}
          </div>
        )}
      </div>
      {tooltip && (
        <Popover id={`range-tooltip-${id}`} popoverRef={popoverRef} followMouse>
          {tooltip}
        </Popover>
      )}
    </div>
  );
};

export default Range;
