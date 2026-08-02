import { useRef } from "react";
import { Quaternion, Vector3 } from "three";
import { useThrottledFrame } from "../../hooks/useThrottledFrame";

const Z_AXIS = new Vector3(0, 0, 1);
const _quat = new Quaternion();
const _pos = new Vector3();
const FULL_TURN_RADIANS = Math.PI * 2;

export default function OrbitModifier({
  orbitControlsRef,
  spiralAxis,
  speed,
  isEnabled,
  orbitAngleRef,
}) {
  const baseAzimuthalAngleRef = useRef(null);

  useThrottledFrame((_, delta) => {
    if (!isEnabled || !orbitControlsRef.current) return;

    if (spiralAxis === "z") {
      const controls = orbitControlsRef.current;
      const cam = controls.object;
      const target = controls.target;
      const angleStep = (speed / 10) * delta;

      _pos.copy(cam.position).sub(target);
      _quat.setFromAxisAngle(Z_AXIS, angleStep);
      _pos.applyQuaternion(_quat);
      cam.position.copy(_pos.add(target));
      cam.up.applyQuaternion(_quat);
      controls.update();

      // No damping involved on this path (camera is moved directly),
      // so manual accumulation stays accurate here
      if (orbitAngleRef) {
        orbitAngleRef.current =
          (orbitAngleRef.current + angleStep) % FULL_TURN_RADIANS;
      }
    } else {
      const controls = orbitControlsRef.current;

      controls.setAzimuthalAngle(controls.getAzimuthalAngle() + speed * delta);

      // Damping means the controls haven't actually reached the angle we
      // just requested. Read the real, current angle instead of trusting
      // our own requested step, so Mesha's compensation never outpaces
      // the camera's true (damped) motion
      if (orbitAngleRef) {
        const actualAzimuthalAngle = controls.getAzimuthalAngle();
        if (baseAzimuthalAngleRef.current === null) {
          baseAzimuthalAngleRef.current = actualAzimuthalAngle;
        }
        orbitAngleRef.current =
          actualAzimuthalAngle - baseAzimuthalAngleRef.current;
      }
    }
  });

  return null;
}
