import { useRef, useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader, DoubleSide, LinearFilter } from "three";

const MeshaBadge = ({ textureFile, position, scale = [0.5, 0.5, 1] }) => {
  const texture = useLoader(TextureLoader, textureFile);
  const meshRef = useRef();

  useEffect(() => {
    if (texture) {
      texture.generateMipmaps = false;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.needsUpdate = true;
    }
  }, [texture]);

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent side={DoubleSide} />
    </mesh>
  );
};

export default MeshaBadge;
