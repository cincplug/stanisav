import { useControls } from "../../contexts/ControlsContext";
import controlsConfig from "../../config/controls.json";
import { useLayoutEffect, useRef } from "react";
import Range from "./ux/Range";
import "./Flowers.css";

const Flowers = () => {
  const { controls, updateControl } = useControls();
  const containerRef = useRef(null);

  const rangeControls = Object.entries(controlsConfig)
    .filter(([group]) => group !== "Header")
    .flatMap(([_, group]) =>
      Object.entries(group)
        .filter(
          ([_, config]) => config.isShownInMenu && config.type === "range",
        )
        .map(([id, config]) => ({ id, ...config })),
    );

  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.setProperty("--count", rangeControls.length);
    }
  });

  return (
    <div ref={containerRef} className="flowers">
      {rangeControls.map((control, i) => (
        <div key={control.id} className="flower-stem" style={{ "--i": i + 1 }}>
          <Range
            min={control.min}
            max={control.max}
            step={control.step}
            value={controls[control.id]}
            onChange={(e) =>
              updateControl(control.id, parseFloat(e.target.value))
            }
          />
        </div>
      ))}
    </div>
  );
};

export default Flowers;
