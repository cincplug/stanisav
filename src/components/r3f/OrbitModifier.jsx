import { Quaternion, Vector3 } from "three";
import { useThrottledFrame } from "../../hooks/useThrottledFrame";

const Z_AXIS = new Vector3(0, 0, 1);
const _quat = new Quaternion();
const _pos = new Vector3();

export default function OrbitModifier({
  orbitControlsRef,
  axis,
  speed,
  isEnabled,
}) {
  useThrottledFrame((_, delta) => {
    if (!isEnabled || !orbitControlsRef.current) return;

    if (axis === "z") {
      const controls = orbitControlsRef.current;
      const cam = controls.object;
      const target = controls.target;

      _pos.copy(cam.position).sub(target);
      _quat.setFromAxisAngle(Z_AXIS, (speed / 10) * delta);
      _pos.applyQuaternion(_quat);
      cam.position.copy(_pos.add(target));
      cam.up.applyQuaternion(_quat);
      controls.update();
    } else {
      orbitControlsRef.current.setAzimuthalAngle(
        orbitControlsRef.current.getAzimuthalAngle() + speed * delta,
      );
    }
  });

  return null;
}
