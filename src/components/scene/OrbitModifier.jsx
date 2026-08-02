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
  const previousAzimuthalAngleRef = useRef(null);

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
        orbitAngleRef.current = orbitAngleRef.current + angleStep;
      }
    } else {
      const controls = orbitControlsRef.current;

      controls.setAzimuthalAngle(controls.getAzimuthalAngle() + speed * delta);

      // getAzimuthalAngle() is wrapped to [-PI, PI] by three.js, so it
      // jumps once per full orbit. Accumulate the small per-frame delta
      // instead of an absolute difference, unwrapping that delta if it
      // looks like it crossed the wrap boundary, so orbitAngleRef stays
      // continuous and Mesha's damped compensation never has to chase
      // a sudden target jump
      if (orbitAngleRef) {
        const currentAzimuthalAngle = controls.getAzimuthalAngle();
        if (previousAzimuthalAngleRef.current === null) {
          previousAzimuthalAngleRef.current = currentAzimuthalAngle;
        }

        let angleDelta =
          currentAzimuthalAngle - previousAzimuthalAngleRef.current;
        if (angleDelta > Math.PI) angleDelta -= FULL_TURN_RADIANS;
        if (angleDelta < -Math.PI) angleDelta += FULL_TURN_RADIANS;

        orbitAngleRef.current = orbitAngleRef.current + angleDelta;
        previousAzimuthalAngleRef.current = currentAzimuthalAngle;
      }
    }
  });

  return null;
}
