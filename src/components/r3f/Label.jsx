import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import visualConstants from "../../config/visualConstants.json";

const {
  languageNode: { labelColor, labelFont, labelPadding }
} = visualConstants;

const Label = ({ children, position, fontSize, backgroundColor }) => {
  const labelRef = useRef();
  const [isHovered, setIsHovered] = useState(false);

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
      color={labelColor}
      font={labelFont}
      anchorX="center"
      anchorY="middle"
      outlineWidth={fontSize * labelPadding}
      outlineColor={isHovered ? "yellow" : backgroundColor}
      onPointerOver={() => {
        setIsHovered(true);
      }}
      onPointerOut={() => {
        setIsHovered(false);
      }}
    >
      {children}
    </Text>
  );
};

export default Label;
