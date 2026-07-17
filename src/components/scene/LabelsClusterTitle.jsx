import { useMemo } from "react";
import { useConfigContext } from "../../contexts/ConfigContext";
import { getClusterTopCenter } from "../../utils/sceneUtils";
import Title from "./Title";

const LabelsClusterTitle = ({ languagePositions, title }) => {
  const topCenter = useMemo(
    () => getClusterTopCenter(languagePositions),
    [languagePositions],
  );

  const { config } = useConfigContext();
  const { labelSize, boardTitleGap, white } = config;

  return (
    <Title
      position={[topCenter.x, topCenter.y + boardTitleGap, topCenter.z]}
      text={title}
      fontSize={labelSize}
      color={white}
    />
  );
};

export default LabelsClusterTitle;
