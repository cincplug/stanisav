import { Text } from "@react-three/drei";

const Tooltip = ({ position, label, value }) => {
  if (!position) return null;
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[1.5, 0.5]} />
        <meshStandardMaterial color="#222" transparent opacity={0.85} />
      </mesh>
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.18}
        anchorX="center"
        anchorY="middle"
        color="#fff"
        outlineWidth={0}
        maxWidth={1.4}
        fontWeight="normal"
      >
        {`${label}: ${value}`}
      </Text>
    </group>
  );
};

export default Tooltip;
