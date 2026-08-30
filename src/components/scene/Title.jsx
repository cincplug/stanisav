import { Text } from "@react-three/drei";

const Title = ({
  text,
  fontSize,
  color,
  anchorX = "center",
  anchorY = "bottom",
  ...rest
}) => (
  <Text
    font="/fonts/RobotoSlab-Regular.ttf"
    fontSize={fontSize}
    anchorX={anchorX}
    anchorY={anchorY}
    color={color}
    {...rest}
  >
    {text}
  </Text>
);

export default Title;
