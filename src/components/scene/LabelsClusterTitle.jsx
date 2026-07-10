import { Text } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { useConfigContext } from "../../contexts/ConfigContext";
import { getClusterTopCenter } from "../../utils/sceneUtils";

const LabelsClusterTitle = ({ languagePositions, title }) => {
  const titleRef = useRef();

  const topCenter = useMemo(
    () => getClusterTopCenter(languagePositions),
    [languagePositions],
  );

  const { config } = useConfigContext();
  const { boardTitleGap, white } = config;

  useEffect(() => {
    if (titleRef.current && topCenter) {
      titleRef.current.position.set(
        topCenter.x,
        topCenter.y + boardTitleGap,
        topCenter.z,
      );
    }
  }, [topCenter, boardTitleGap]);

  return (
    <Text
      font="/fonts/RobotoSlab-SemiBold.ttf"
      ref={titleRef}
      fontSize={2}
      fontWeight="bold"
      anchorX="center"
      anchorY="bottom"
      color={white}
    >
      {title}
    </Text>
  );
};

export default LabelsClusterTitle;
