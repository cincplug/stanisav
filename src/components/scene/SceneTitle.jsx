import { useMemo } from "react";
import { useConfigContext } from "../../contexts/ConfigContext";
import { getClusterTopCenter } from "../../utils/sceneUtils";
import Title from "./Title";

const SceneTitle = ({ text, formattedPositions }) => {
  const { config } = useConfigContext();
  const { labelSize, boardTitleGap, white } = config;

  const topCenter = useMemo(
    () => getClusterTopCenter(formattedPositions),
    [formattedPositions],
  );

  return (
    <Title
      position={[topCenter.x, topCenter.y + boardTitleGap * 2, topCenter.z]}
      text={text}
      fontSize={labelSize * 2}
      color={white}
      anchorY="bottom"
      anchorX="left"
    />
  );
};

export default SceneTitle;
