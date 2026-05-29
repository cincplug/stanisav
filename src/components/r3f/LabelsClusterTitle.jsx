import { Text } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { config } from "../../modules/configStore";
import { getClusterTopCenter } from "../../utils/sceneUtils";

const LabelsClusterTitle = ({ languagePositions, title }) => {
  const titleRef = useRef();

  const topCenter = useMemo(
    () => getClusterTopCenter(languagePositions),
    [languagePositions],
  );

  useEffect(() => {
    if (titleRef.current && topCenter) {
      titleRef.current.position.set(
        topCenter.x,
        topCenter.y + config.segmentation.titleOffset,
        topCenter.z,
      );
    }
  }, [topCenter]);

  return (
    <Text
      ref={titleRef}
      fontSize={2}
      fontWeight="bold"
      anchorX="center"
      anchorY="bottom"
      color="#e7ebef"
    >
      {title}
    </Text>
  );
};

export default LabelsClusterTitle;
