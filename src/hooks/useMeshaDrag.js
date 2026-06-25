import { useDrag } from "@use-gesture/react";
import { useRef } from "react";
import { useConfigContext } from "../contexts/ConfigContext.jsx";
import { useDragContext } from "../contexts/DragContext.jsx";
import { useLanguageSelectionContext } from "../contexts/LanguageSelectionContext.jsx";
import { resolveControlBounds } from "../utils/configUtils.js";

export const useMeshaDrag = (bindings, linguisticProperty = null) => {
  const { config, updateConfigValue } = useConfigContext();
  const { notifyDragStart, notifyDragEnd } = useDragContext();
  const { selectProperty } = useLanguageSelectionContext();

  const { dragSensitivity, timeRate } = config.mesha;

  const dragStartValuesRef = useRef({});
  const dragThrottleRef = useRef({ elapsed: 0, lastTime: 0 });

  // Reads current value from config by dot-notation key
  const resolveCurrentValue = (binding) => {
    const dotKey = binding.advancedKey ?? binding.controlKey;
    return dotKey.split(".").reduce((node, k) => node?.[k], config) ?? 0;
  };

  // Writes updated value back into config by dot-notation key
  const applyValue = (binding, value) => {
    const dotKey = binding.advancedKey ?? binding.controlKey;
    updateConfigValue(dotKey, value);
  };

  const bind = useDrag(
    ({ movement: [mx, my], first, last, active, event }) => {
      event?.stopPropagation();

      if (first) {
        notifyDragStart();
        if (linguisticProperty) selectProperty(linguisticProperty);
        dragThrottleRef.current = { elapsed: 0, lastTime: performance.now() };

        const snapshot = {};
        if (bindings.x) snapshot.x = resolveCurrentValue(bindings.x);
        if (bindings.y) snapshot.y = resolveCurrentValue(bindings.y);
        dragStartValuesRef.current = snapshot;
      }

      if (last) {
        notifyDragEnd();
        if (linguisticProperty) selectProperty(null);
        return;
      }

      if (!active) return;

      const now = performance.now();
      const throttle = dragThrottleRef.current;
      throttle.elapsed += now - throttle.lastTime;
      throttle.lastTime = now;

      if (throttle.elapsed < timeRate) return;
      throttle.elapsed -= timeRate;

      if (bindings.x) {
        const { min, max } = resolveControlBounds(
          bindings.x.advancedKey ?? bindings.x.controlKey,
        );
        const rawValue = dragStartValuesRef.current.x + mx * dragSensitivity;
        applyValue(bindings.x, Math.min(Math.max(rawValue, min), max));
      }

      if (bindings.y) {
        const { min, max } = resolveControlBounds(
          bindings.y.advancedKey ?? bindings.y.controlKey,
        );
        const rawValue = dragStartValuesRef.current.y - my * dragSensitivity;
        applyValue(bindings.y, Math.min(Math.max(rawValue, min), max));
      }
    },
    { pointerEvents: true },
  );

  return bind;
};
