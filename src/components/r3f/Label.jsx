import { useRef, useState, useMemo } from "react";
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
  const [isHovered, setIsHovered] = useState(false);

  const textMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: labelColor,
        roughness: 0.8
      }),
    [labelColor]
  );

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
      {isHovered && (
        <pointLight
          position={[0, 0, 2]}
          intensity={10}
          distance={10}
          color={backgroundColor}
        />
      )}
      <Text
        fontSize={fontSize}
        anchorX="center"
        anchorY="middle"
        outlineWidth={(fontSize * 2) / 3}
        outlineColor={backgroundColor}
        position={[0, 0, 1 / 10]}
        material={textMaterial}
      >
        {children}
      </Text>
    </group>
  );
};

export default Label;
