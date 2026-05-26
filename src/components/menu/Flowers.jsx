import { useControls } from "../../contexts/ControlsContext";
import controlsConfig from "../../config/controls.json";
import { localizeControlConfig } from "../../utils/i18nUtils";
import { useLayoutEffect, useRef } from "react";
import Range from "./ux/Range";
import { thumbIconMap } from "./thumbIconMap";
import "./Flowers.css";

const Flowers = ({ selectedLanguage }) => {
  const { controls, updateControl } = useControls();
  const containerRef = useRef(null);

  const groupsWhenZoomed = ["Mesha", "Camera", "Motion"];

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
        const { id, type, label, min, max, step } = control;
        return (
          <div key={id} className="flower-stem" style={{ "--i": i + 1 }}>
            <Range
              min={min}
              max={max}
              step={step}
              value={controls[id]}
              tooltip={`${label}: ${controls[id]}`}
              onChange={(e) => updateControl(id, parseFloat(e.target.value))}
              thumbIcon={thumbIconMap[id]}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Flowers;
