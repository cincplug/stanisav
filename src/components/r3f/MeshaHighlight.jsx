import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { extend } from "@react-three/fiber";
import React from "react";
extend({ ParametricGeometry });

const MeshaHighlight = ({
  geometry,
  geometryArgs,
  position = [0, 0, 0],
  color = "#ff0",
}) => {
  return (
    <mesh position={position}>
      {React.createElement(geometry, { args: geometryArgs })}
      <meshBasicMaterial color={color} wireframe />
    </mesh>
  );
};

export default MeshaHighlight;
