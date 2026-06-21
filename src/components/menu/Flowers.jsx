import { useLayoutEffect, useRef } from "react";
import controlsConfig from "../../config/controls.json";
import { useConfigContext } from "../../contexts/ControlsContext";
import { localizeControlConfig } from "../../utils/i18nUtils";
import "./Flowers.css";
import { thumbIconMap } from "./thumbIconMap";
import Range from "./ux/Range";

const Flowers = ({ selectedLanguage }) => {
  if (selectedLanguage) return null;

  const { controls, updateConfigValue } = useConfigContext();
  const containerRef = useRef(null);

  const rangeControls = Object.entries(controlsConfig)

    .flatMap(([_, group]) =>
      Object.entries(group)
        .filter(
          ([_, config]) => config.isShownInMenu && config.type === "range",
        )
        .map(([id, config]) => ({ id, ...localizeControlConfig(id, config) })),
    );

  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.setProperty("--count", rangeControls.length);
    }
  });

  return (
    <div ref={containerRef} className="flowers">
      {rangeControls.map((control, i) => {
        const { id, label, min, max, step } = control;
        return (
          <div key={id} className="flower-stem" style={{ "--i": i + 1 }}>
            <Range
              min={min}
              max={max}
              step={step}
              value={controls[id]}
              tooltip={`${label}: ${controls[id]}`}
              onChange={(e) =>
                updateConfigValue(id, parseFloat(e.target.value))
              }
              thumbIcon={thumbIconMap[id]}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Flowers;
