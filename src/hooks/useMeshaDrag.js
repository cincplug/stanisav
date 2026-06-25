import { useDrag } from "@use-gesture/react";
import { useRef } from "react";
import { useConfigContext } from "../contexts/ConfigContext.jsx";
import { useDragContext } from "../contexts/DragContext.jsx";
import { useLanguageSelectionContext } from "../contexts/LanguageSelectionContext.jsx";

export const useMeshaDrag = (bindings, linguisticProperty = null) => {
  const { config, updateConfigValue } = useConfigContext();
  const { notifyDragStart, notifyDragEnd } = useDragContext();
  const { selectProperty } = useLanguageSelectionContext();

  const { dragSensitivity, timeRate, dragSessionRange } = config.mesha;

  const dragStartValuesRef = useRef({});
  const dragThrottleRef = useRef({ elapsed: 0, lastTime: 0 });

  const resolveCurrentValue = (binding) =>
    binding.configKey.split(".").reduce((node, k) => node?.[k], config) ?? 0;

  const applyValue = (binding, value) =>
    updateConfigValue(binding.configKey, value);

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
        const startX = dragStartValuesRef.current.x;
        const rawValue = startX + mx * dragSensitivity;
        applyValue(
          bindings.x,
          Math.min(
            Math.max(rawValue, startX - dragSessionRange),
            startX + dragSessionRange,
          ),
        );
      }

      if (bindings.y) {
        const startY = dragStartValuesRef.current.y;
        const rawValue = startY - my * dragSensitivity;
        applyValue(
          bindings.y,
          Math.min(
            Math.max(rawValue, startY - dragSessionRange),
            startY + dragSessionRange,
          ),
        );
      }
    },
    { pointerEvents: true },
  );

  return bind;
};
