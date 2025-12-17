import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { MeshStandardMaterial } from "three";

const Label = ({
  children,
  position,
  fontSize,
  labelColor,
  backgroundColor
}) => {
  const labelRef = useRef();

  const textMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: labelColor
      }),
    [labelColor]
  );

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
      material={textMaterial}
    >
      {children}
    </Text>
  );
};

export default Label;
