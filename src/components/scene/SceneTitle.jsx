import { useConfigContext } from "../../contexts/ConfigContext";
import Title from "./Title";

const SceneTitle = ({ text, position }) => {
  const { config } = useConfigContext();
  const { labelSize, white } = config;

  return (
    <Title
      position={position}
      text={text}
      fontSize={labelSize * 2}
      color={white}
      anchorY="bottom"
      anchorX="center"
    />
  );
};

export default SceneTitle;
