import { useRef, forwardRef, useImperativeHandle, useMemo } from "react";
import { extend } from "@react-three/fiber";
import { Color, DoubleSide } from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import {
  cheekVertexShader,
  plainTextureFragmentShader,
} from "../../shaders/shader";

extend({ ParametricGeometry });

const MeshaCheek = forwardRef(
  ({ color1, color2, audioReactiveSurface, segments }, ref) => {
    const mesh1Ref = useRef();
    const mesh2Ref = useRef();

    useImperativeHandle(ref, () => ({
      mesh1: mesh1Ref.current,
      mesh2: mesh2Ref.current,
    }));

    // Memoize uniforms for both cheeks (just color)
    const leftCheekUniforms = useMemo(
      () => ({ uBaseColor: { value: new Color(color1) } }),
      [color1],
    );
    const rightCheekUniforms = useMemo(
      () => ({ uBaseColor: { value: new Color(color2) } }),
      [color2],
    );

    return (
      <>
        {/* Left cheek: color only */}
        <mesh
          ref={mesh2Ref}
          position={[-1.2, 1, 1]}
          scale={[-1 / 2, 3 / 4, 1]}
          rotation={[0, -1 / 20, 0]}
        >
          <parametricGeometry
            args={[audioReactiveSurface, segments, segments]}
          />
          <shaderMaterial
            args={[
              {
                uniforms: leftCheekUniforms,
                vertexShader: cheekVertexShader,
                fragmentShader: plainTextureFragmentShader,
                side: DoubleSide,
                transparent: false,
              },
            ]}
          />
        </mesh>

        {/* Right cheek: color only */}
        <mesh
          ref={mesh1Ref}
          position={[1.2, 1, 1]}
          scale={[1 / 2, 3 / 4, 1]}
          rotation={[0, 1 / 20, 0]}
        >
          <parametricGeometry
            args={[audioReactiveSurface, segments, segments]}
          />
          <shaderMaterial
            args={[
              {
                uniforms: rightCheekUniforms,
                vertexShader: cheekVertexShader,
                fragmentShader: plainTextureFragmentShader,
                side: DoubleSide,
                transparent: false,
              },
            ]}
          />
        </mesh>
      </>
    );
  },
);

MeshaCheek.displayName = "MeshaCheek";

export default MeshaCheek;
