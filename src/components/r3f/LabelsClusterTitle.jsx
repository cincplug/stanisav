import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Vector3 } from "three";
import { getClusterBottomCenter } from "../../utils/sceneUtils";

const TITLE_OFFSET_Y = 3;

const LabelsClusterTitle = ({ positions, title, opacity }) => {
  const titleRef = useRef();
  const lineRef = useRef();

  useFrame(({ camera }) => {
    const bottomCenter = getClusterBottomCenter(positions);
    if (!bottomCenter || !titleRef.current) return;

    // Title sits below the cluster, connector anchors to bottom center
    const connectorStart = bottomCenter.clone();
    const titlePos = new Vector3(
      bottomCenter.x,
      bottomCenter.y - TITLE_OFFSET_Y,
      bottomCenter.z,
    );

    titleRef.current.position.copy(titlePos);
    titleRef.current.lookAt(camera.position);

    if (lineRef.current) {
      const points = lineRef.current.geometry.attributes.position;
      points.setXYZ(0, connectorStart.x, connectorStart.y, connectorStart.z);
      points.setXYZ(1, titlePos.x, titlePos.y, titlePos.z);
      points.needsUpdate = true;
      lineRef.current.material.opacity = opacity;
    }

    if (titleRef.current.material) {
      titleRef.current.material.opacity = opacity;
    }
  });

  return (
    <group>
      <Text
        ref={titleRef}
        fontSize={1.5}
        anchorX="center"
        anchorY="top"
        color="white"
        material-transparent
        material-opacity={opacity}
      >
        {title}
      </Text>
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array(6)}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="white" transparent opacity={opacity} />
      </line>
    </group>
  );
};

export default LabelsClusterTitle;
