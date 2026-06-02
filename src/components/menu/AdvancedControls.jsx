import { useEffect, useRef } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { useI18n } from "../../contexts/I18nContext";
import { useAdvancedControlRanges } from "../../hooks/useAdvancedControlRanges";
import Range from "./ux/Range";

const AdvancedControls = () => {
  const {
    advancedControls,
    updateAdvancedControl,
    isAdvancedOpen,
    toggleAdvanced,
  } = useControls();
  const groups = useAdvancedControlRanges();
  const advancedRef = useRef();
  const { t } = useI18n();

  useEffect(() => {
    if (isAdvancedOpen) {
      advancedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isAdvancedOpen]);

  return (
    <fieldset className="control-group advanced-controls" ref={advancedRef}>
      <legend className="control-item">
        <label>
          <input
            type="checkbox"
            className="advanced-controls-toggle"
            onChange={toggleAdvanced}
          />{" "}
          {t("controls.showMore.label")}{" "}
        </label>
      </legend>

      {isAdvancedOpen &&
        groups.map(({ groupName, entries }) => (
          <fieldset key={groupName} className="control-group">
            <legend>{groupName}</legend>
            <div className="controls-grid">
              {entries.map(({ dotKey, label, min, max, step }) => {
                const currentValue = advancedControls[dotKey];
                return (
                  <div key={dotKey} className="control-item range-control">
                    <label>
                      <span>{label}</span>
                      <span>{currentValue}</span>
                    </label>
                    <Range
                      min={min}
                      max={max}
                      step={step}
                      value={currentValue}
                      onChange={(e) =>
                        updateAdvancedControl(
                          dotKey,
                          step === 1
                            ? parseInt(e.target.value)
                            : e.target.value,
                        )
                      }
                    />
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}
    </fieldset>
  );
};

export default AdvancedControls;
