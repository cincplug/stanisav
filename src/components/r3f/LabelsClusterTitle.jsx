import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Vector3 } from "three";
import { getClusterTopCenter } from "../../utils/sceneUtils";

const TITLE_OFFSET_Y = 1;

const LabelsClusterTitle = ({ positions, title }) => {
  const titleRef = useRef();

  useFrame(({ camera }) => {
    const topCenter = getClusterTopCenter(positions);
    if (!topCenter || !titleRef.current) return;

    titleRef.current.position.set(
      topCenter.x,
      topCenter.y + TITLE_OFFSET_Y,
      topCenter.z,
    );
    titleRef.current.lookAt(camera.position);
  });

  return (
    <Text
      ref={titleRef}
      fontSize={1.5}
      anchorX="center"
      anchorY="bottom"
      color="white"
    >
      {title}
    </Text>
  );
};

export default LabelsClusterTitle;
