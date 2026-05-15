import { useControls } from "../../contexts/ControlsContext";
import controlsConfig from "../../config/controls.json";
import { useLayoutEffect, useRef } from "react";
import "./Flowers.css";

const Flowers = () => {
  const { controls } = useControls();
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
      containerRef.current.style.setProperty("--n", rangeControls.length);
    }
  });

  return (
    <div ref={containerRef} className={`flowers`}>
      {rangeControls.map((control, i) => (
        <div key={control.id} className="flower-stem" style={{ "--i": i + 1 }}>
          <input
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={controls[control.id]}
            readOnly
          />
        </div>
      ))}
    </div>
  );
};

export default Flowers;
