import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const Label = ({
  children,
  position,
  fontSize,
  labelColor,
  backgroundColor
}) => {
  const labelRef = useRef();

  useFrame(({ camera }) => {
    if (labelRef.current) {
      labelRef.current.lookAt(camera.position);
    }
  });

  return (
    <Text
      position={position}
      ref={labelRef}
      fontSize={fontSize}
      fontWeight="bold"
      anchorX="center"
      anchorY="middle"
      outlineWidth={fontSize / 2}
      outlineColor={backgroundColor}
      color={labelColor}
    >
      {children}
    </Text>
  );
};

export default Label;
