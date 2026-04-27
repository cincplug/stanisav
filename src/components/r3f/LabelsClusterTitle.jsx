import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Vector3 } from "three";
import { getClusterTopCenter } from "../../utils/sceneUtils";
import sceneConfig from "../../config/sceneConfig.json";

const LabelsClusterTitle = ({ positions, title }) => {
  const titleRef = useRef();

  useFrame(({ camera }) => {
    const topCenter = getClusterTopCenter(positions);
    if (!topCenter || !titleRef.current) return;

    titleRef.current.position.set(
      topCenter.x,
      topCenter.y + sceneConfig.clusterTitleOffset,
      topCenter.z,
    );
    titleRef.current.lookAt(camera.position);
  });

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
