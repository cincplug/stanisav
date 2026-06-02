import { useEffect, useRef, useState } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { useI18n } from "../../contexts/I18nContext";
import { useAdvancedControlRanges } from "../../hooks/useAdvancedControlRanges";
import { RotateSpeedIcon, ExpandIcon, CircleIcon } from "./MenuIcons";
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

  const [openGroups, setOpenGroups] = useState({});

  useEffect(() => {
    if (isAdvancedOpen) {
      advancedRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isAdvancedOpen]);

  const toggleGroup = (groupName) => {
    setOpenGroups((current) => ({
      ...current,
      [groupName]: !current[groupName],
    }));
  };

  const handleResetClick = (e, dotKey, staticDefault) => {
    e.preventDefault();
    e.stopPropagation();
    updateAdvancedControl(dotKey, staticDefault);
  };

  return (
    <fieldset className="control-group advanced-controls" ref={advancedRef}>
      <legend className="control-item">
        <label>
          <input
            type="checkbox"
            className="advanced-controls-toggle"
            checked={isAdvancedOpen}
            onChange={toggleAdvanced}
          />
          {t("controls.showMore.label")}
        </label>
      </legend>

      {isAdvancedOpen &&
        groups.map(({ groupName, entries }) => {
          const isGroupExpanded = !!openGroups[groupName];

          return (
            <fieldset
              key={groupName}
              className={`control-group ${isGroupExpanded ? "expanded" : "collapsed"}`}
            >
              <legend className="accordion-item-title">
                <button
                  type="button"
                  onClick={() => toggleGroup(groupName)}
                  aria-expanded={isGroupExpanded}
                >
                  {groupName} <ExpandIcon />
                </button>
              </legend>

              {isGroupExpanded && (
                <div className="controls-grid">
                  {entries.map(
                    ({ dotKey, label, min, max, step, staticDefault }) => {
                      const currentValue = advancedControls[dotKey];
                      const inputId = `advanced-control-${dotKey.replaceAll(".", "-")}`;

                      return (
                        <div
                          key={dotKey}
                          className="control-item range-control"
                        >
                          <label htmlFor={inputId}>
                            <span>{label}</span>

                            <div className="value">
                              {currentValue}
                              <button
                                type="button"
                                className="reset-button"
                                title={t("menu.reset")}
                                onClick={(e) =>
                                  handleResetClick(e, dotKey, staticDefault)
                                }
                              >
                                <RotateSpeedIcon className="reset-icon" />
                              </button>
                            </div>
                          </label>

                          <Range
                            id={inputId}
                            min={min}
                            max={max}
                            step={step}
                            value={currentValue}
                            thumbIcon={CircleIcon}
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
                    },
                  )}
                </div>
              )}
            </fieldset>
          );
        })}
    </fieldset>
  );
};

export default AdvancedControls;
