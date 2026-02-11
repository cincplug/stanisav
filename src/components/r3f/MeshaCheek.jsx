import { useRef, forwardRef, useImperativeHandle } from "react";
import { extend } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";

extend({ ParametricGeometry });

const MeshaCheek = forwardRef(
  (
    {
      leftCheekMaterial,
      rightCheekMaterial,
      audioReactiveSurface,
      leftSegments,
      rightSegments,
      scores,
    },
    ref,
  ) => {
    const mesh1Ref = useRef();
    const mesh2Ref = useRef();
    const x = 0.7;
    const y = (scores.morphology + 1) / 4;
    const z = 1;

    useImperativeHandle(ref, () => ({
      mesh1: mesh1Ref.current,
      mesh2: mesh2Ref.current,
    }));

    return (
      <>
        {/* Left cheek */}
        <mesh
          ref={mesh2Ref}
          position={[-x, y, z]}
          scale={[-1 / 2, 3 / rightSegments, 1]}
        >
          <parametricGeometry
            args={[audioReactiveSurface, leftSegments, leftSegments]}
          />
          <shaderMaterial args={[leftCheekMaterial]} />
        </mesh>

        {/* Right cheek */}
        <mesh
          ref={mesh1Ref}
          position={[x, y, z]}
          scale={[1 / 2, 3 / rightSegments, 1]}
        >
          <parametricGeometry
            args={[audioReactiveSurface, rightSegments, rightSegments]}
          />
          <shaderMaterial args={[rightCheekMaterial]} />
        </mesh>
      </>
    );
  },
);

export default MeshaCheek;
