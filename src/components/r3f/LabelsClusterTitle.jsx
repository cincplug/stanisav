import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Vector3 } from "three";
import { getClusterTopCenter } from "../../utils/sceneUtils";
import config from "../../config/config.json";

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
        topCenter.y + config.clusterTitleOffset,
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
