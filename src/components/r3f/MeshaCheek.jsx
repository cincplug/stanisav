import { useRef, useMemo, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { Color } from "three";
import { extend } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import linguisticConfig from "../../config/linguisticConfig.json";

extend({ ParametricGeometry });

const MeshaCheek = forwardRef(
  ({ color, linguisticProperties, audioReactiveSurface, segments }, ref) => {
    const mesh1Ref = useRef();
    const mesh2Ref = useRef();

    useImperativeHandle(ref, () => ({
      mesh1: mesh1Ref.current,
      mesh2: mesh2Ref.current,
    }));

    const colorObj = new Color(color);
    const accentColor = new Color("#ddddff").sub(colorObj);

    return (
      <>
        {/* Left cheek (morphology) */}
        <mesh
          ref={mesh2Ref}
          position={[-1, 1, 1]}
          scale={[-1 / 2, 3 / 4, 1]}
          rotation={[0, -1 / 20, 0]}
        >
          <parametricGeometry
            args={[audioReactiveSurface, segments, segments]}
          />
          <meshStandardMaterial color={colorObj} side={THREE.DoubleSide} />
        </mesh>

        {/* Right cheek (word order) */}
        <mesh
          ref={mesh1Ref}
          position={[1, 1, 1]}
          scale={[1 / 2, 3 / 4, 1]}
          rotation={[0, 1 / 20, 0]}
        >
          <parametricGeometry
            args={[audioReactiveSurface, segments, segments]}
          />
          <meshStandardMaterial color={colorObj} side={THREE.DoubleSide} />
        </mesh>
      </>
    );
  }
);

MeshaCheek.displayName = "MeshaCheek";

export default MeshaCheek;
