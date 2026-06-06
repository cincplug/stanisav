import { useDrag } from "@use-gesture/react";
import { useRef } from "react";
import { useControls } from "../contexts/ControlsContext";
import { config } from "../modules/configStore";
import { resolveControlBounds } from "../utils/controlUtils";

// Accepts a binding object from dragBindings.js, e.g.:
// { x: { controlKey: "eyeX" }, y: { controlKey: "eyeY" } }
// Returns a bind function to spread onto a mesh or group.
export const useMeshaDrag = (bindings) => {
  const { controls, updateControl, advancedControls, updateAdvancedControl } =
    useControls();

  const { dragSensitivity, timeRate } = config.meshaVisualization;

  // Snapshots of values at the moment a drag gesture starts
  const dragStartValuesRef = useRef({});

  // Throttle state: elapsed ms since last update and timestamp of last event
  const dragThrottleRef = useRef({ elapsed: 0, lastTime: 0 });

  // Resolves the current live value for a binding axis
  const resolveCurrentValue = (binding) => {
    if (binding.controlKey) return controls[binding.controlKey];
    if (binding.advancedKey) return advancedControls[binding.advancedKey];
    return 0;
  };

  // Writes a new value to the correct updater
  const applyValue = (binding, value) => {
    if (binding.controlKey) updateControl(binding.controlKey, value);
    if (binding.advancedKey) updateAdvancedControl(binding.advancedKey, value);
  };

  const bind = useDrag(
    ({ movement: [mx, my], first, active, event }) => {
      event?.stopPropagation();

      if (first) {
        dragThrottleRef.current = { elapsed: 0, lastTime: performance.now() };

        // Snapshot current value for each bound axis
        const snapshot = {};
        if (bindings.x) snapshot.x = resolveCurrentValue(bindings.x);
        if (bindings.y) snapshot.y = resolveCurrentValue(bindings.y);
        dragStartValuesRef.current = snapshot;
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
        // Invert y: dragging up (negative my) should increase the value
        const rawValue = dragStartValuesRef.current.y - my * dragSensitivity;
        applyValue(bindings.y, Math.min(Math.max(rawValue, min), max));
      }
    },
    { pointerEvents: true },
  );

  return bind;
};
