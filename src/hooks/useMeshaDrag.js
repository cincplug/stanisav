import { useDrag } from "@use-gesture/react";
import { useRef } from "react";
import { useControlsContext } from "../contexts/ControlsContext";
import { useDragContext } from "../contexts/DragContext";
import { config } from "../modules/configStore";
import { resolveControlBounds } from "../utils/controlUtils";

export const useMeshaDrag = (bindings) => {
  const { controls, updateControl, advancedControls, updateAdvancedControl } =
    useControlsContext();
  const { notifyDragStart, notifyDragEnd } = useDragContext();

  const { dragSensitivity, timeRate } = config.meshaVisualization;

  const dragStartValuesRef = useRef({});
  const dragThrottleRef = useRef({ elapsed: 0, lastTime: 0 });

  const resolveCurrentValue = (binding) => {
    if (binding.controlKey) return controls[binding.controlKey];
    if (binding.advancedKey) return advancedControls[binding.advancedKey];
    return 0;
  };

  const applyValue = (binding, value) => {
    if (binding.controlKey) updateControl(binding.controlKey, value);
    if (binding.advancedKey) updateAdvancedControl(binding.advancedKey, value);
  };

  const bind = useDrag(
    ({ movement: [mx, my], first, last, active, event }) => {
      event?.stopPropagation();

      if (first) {
        notifyDragStart();
        dragThrottleRef.current = { elapsed: 0, lastTime: performance.now() };

        const snapshot = {};
        if (bindings.x) snapshot.x = resolveCurrentValue(bindings.x);
        if (bindings.y) snapshot.y = resolveCurrentValue(bindings.y);
        dragStartValuesRef.current = snapshot;
      }

      if (last) {
        notifyDragEnd();
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
          bindings.x.controlKey,
          bindings.x.advancedKey,
        );
        const rawValue = dragStartValuesRef.current.x + mx * dragSensitivity;
        applyValue(bindings.x, Math.min(Math.max(rawValue, min), max));
      }

      if (bindings.y) {
        const { min, max } = resolveControlBounds(
          bindings.y.controlKey,
          bindings.y.advancedKey,
        );
        const rawValue = dragStartValuesRef.current.y - my * dragSensitivity;
        applyValue(bindings.y, Math.min(Math.max(rawValue, min), max));
      }
    },
    { pointerEvents: true },
  );

  return bind;
};
