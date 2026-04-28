import { useFrame } from "@react-three/fiber";
import { Vector3, Quaternion } from "three";

/**
 * Custom autorotation for OrbitControls.
 * axis: "y" | "z" | "xy" (hybrid, switches to "x" after 90deg)
 */
export default function CustomOrbitAutoRotate({
  orbitControlsRef,
  axis,
  speed,
  isEnabled,
}) {
  useFrame((_, delta) => {
    if (!isEnabled || !orbitControlsRef.current) return;
    if (axis === "z") {
      // Rotate camera position and up vector around Z axis
      const controls = orbitControlsRef.current;
      const cam = controls.object;
      const target = controls.target;
      const pos = cam.position.clone().sub(target);
      const rot = new Quaternion().setFromAxisAngle(
        new Vector3(0, 0, 1),
        speed * delta,
      );
      pos.applyQuaternion(rot);
      cam.position.copy(pos.add(target));
      cam.up.applyQuaternion(rot);
      controls.update();
    } else {
      // Default: rotate around y axis
      // Also for x axis distribution because OrbitControls clamps it around 90 degrees
      orbitControlsRef.current.setAzimuthalAngle(
        orbitControlsRef.current.getAzimuthalAngle() + speed * delta,
      );
    }
  });
  return null;
}
