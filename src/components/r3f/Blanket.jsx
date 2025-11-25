import { useMemo } from "react";
import * as THREE from "three";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry";

const Blanket = ({ positions, languages, color }) => {
  const createConvexBlanket = (positions, languages) => {
    if (!positions || languages.length < 4) {
      return null;
    }
    const points = [];
    languages.forEach((langCode) => {
      const pos = positions[langCode];
      if (pos) {
        points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
      }
    });
    if (points.length < 2) {
      return null;
    }
    try {
      return new ConvexGeometry(points);
    } catch (e) {
      console.warn("Failed to create convex blanket:", e);
      return null;
    }
  };
  const geometry = useMemo(
    () => createConvexBlanket(positions, languages),
    [positions, languages]
  );

  if (!geometry) {
    return null;
  }

  return (
    <mesh geometry={geometry} renderOrder={-1}>
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

export default Blanket;
