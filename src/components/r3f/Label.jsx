import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

const Label = ({
  children,
  position,
  fontSize,
  labelColor,
  backgroundColor,
  outlineWidth
}) => {
  const labelRef = useRef();
  const [isHovered, setIsHovered] = useState(false);

  useFrame(({ camera }) => {
    if (labelRef.current) {
      labelRef.current.lookAt(camera.position);
    }
  });

  return (
    <group
      position={position}
      ref={labelRef}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      <Text
        fontSize={fontSize}
        anchorX="center"
        anchorY="middle"
        outlineWidth={outlineWidth}
        outlineColor={labelColor}
      >
        {children}
      </Text>
      <Text
        fontSize={fontSize}
        anchorX="center"
        anchorY="middle"
        outlineWidth={(fontSize * 2) / 3}
        outlineColor={isHovered ? "yellow" : backgroundColor}
        position={[0, 0, 1 / 10]}
      >
        {children}
        <meshStandardMaterial
          attach="material"
          color={labelColor}
          roughness={0.8}
        />
      </Text>
    </group>
  );
};

export default Label;
