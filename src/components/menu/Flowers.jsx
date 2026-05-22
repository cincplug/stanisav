import { useControls } from "../../contexts/ControlsContext";
import controlsConfig from "../../config/controls.json";
import { localizeControlConfig } from "../../utils/i18nUtils";
import { useLayoutEffect, useRef } from "react";
import Range from "./ux/Range";
import {
  IrrationalityIcon,
  LightIcon,
  RotateSpeedIcon,
  HueIcon,
  LightnessIcon,
  SaturationIcon,
  SwitchDurationIcon,
  ZoomDistanceIcon,
  TensionIcon,
  FrictionIcon,
} from "./MenuIcons";
import "./Flowers.css";

const thumbIconMap = {
  irrationality: IrrationalityIcon,
  light: LightIcon,
  rotateSpeed: RotateSpeedIcon,
  hue: HueIcon,
  lightness: LightnessIcon,
  saturation: SaturationIcon,
  switchDuration: SwitchDurationIcon,
  zoomDistance: ZoomDistanceIcon,
  tension: TensionIcon,
  friction: FrictionIcon,
};

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
      {rangeControls.map((control, i) => (
        <div key={control.id} className="flower-stem" style={{ "--i": i + 1 }}>
          <Range
            min={control.min}
            max={control.max}
            step={control.step}
            value={controls[control.id]}
            tooltip={`${control.label}: ${controls[control.id]}`}
            onChange={(e) =>
              updateControl(control.id, parseFloat(e.target.value))
            }
            thumbIcon={thumbIconMap[control.id]}
          />
        </div>
      ))}
    </div>
  );
};

export default Flowers;
