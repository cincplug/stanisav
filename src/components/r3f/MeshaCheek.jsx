import { useRef, forwardRef, useImperativeHandle } from "react";
import { extend, useLoader } from "@react-three/fiber";
import { Color, DoubleSide, TextureLoader } from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAppState } from "../../contexts/AppStateContext";

extend({ ParametricGeometry });

const MeshaCheek = forwardRef(
  ({ color, audioReactiveSurface, segments, languageCode }, ref) => {
    const { data } = useAppState();
    const linguisticProperties = data?.typologicalFeatures?.[languageCode];

    const mesh1Ref = useRef();
    const mesh2Ref = useRef();

    useImperativeHandle(ref, () => ({
      mesh1: mesh1Ref.current,
      mesh2: mesh2Ref.current,
    }));

    const colorObj = new Color(color);
    const accentColor = new Color("#ddddff").sub(colorObj);
    const wordOrder = linguisticProperties?.wordOrder;
    const textureFile = `/textures/${wordOrder?.toLowerCase()}.png`;
    const texture = useLoader(TextureLoader, textureFile);

    if (texture) {
      texture.center.set(0.5, 0.5);
      texture.rotation = Math.PI / 2 + Math.PI;
      texture.repeat.set(-1, 1);
      texture.needsUpdate = true;
    }

    return (
      <>
        <mesh
          ref={mesh2Ref}
          position={[-1.2, 1, 1]}
          scale={[-1 / 2, 3 / 4, 1]}
          rotation={[0, -1 / 20, 0]}
        >
          <parametricGeometry
            args={[audioReactiveSurface, segments, segments]}
          />
          <meshStandardMaterial color={colorObj} side={DoubleSide} />
        </mesh>

        <mesh
          ref={mesh1Ref}
          position={[1.2, 1, 1]}
          scale={[1 / 2, 2 / 3, 1]}
          rotation={[0, 1 / 20, 0]}
        >
          <parametricGeometry
            args={[audioReactiveSurface, segments, segments]}
          />
          <meshStandardMaterial
            color={accentColor}
            side={DoubleSide}
            map={texture}
          />
        </mesh>
      </>
    );
  }
);

MeshaCheek.displayName = "MeshaCheek";

export default MeshaCheek;
