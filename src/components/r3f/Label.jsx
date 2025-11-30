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
    <group position={position} ref={labelRef}>
      <Text
        fontSize={fontSize}
        font={labelFont}
        anchorX="center"
        anchorY="middle"
        outlineWidth={fontSize * labelPadding + labelPadding / 2}
        outlineColor="#000000"
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        {children}
      </Text>
      <Text
        fontSize={fontSize}
        color={labelColor}
        font={labelFont}
        anchorX="center"
        anchorY="middle"
        outlineWidth={fontSize * labelPadding}
        outlineColor={isHovered ? "yellow" : backgroundColor}
        position={[0, 0, 1 / 10]}
      >
        {children}
      </Text>
    </group>
  );
};

export default Label;
