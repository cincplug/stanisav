import { useRef, forwardRef, useImperativeHandle, useMemo } from "react";
import { extend, useLoader } from "@react-three/fiber";
import { Color, DoubleSide, TextureLoader, ShaderMaterial } from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAppState } from "../../contexts/AppStateContext";
import {
  cheekVertexShader,
  plainTextureFragmentShader,
} from "../../shaders/cheekShader";

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
    // Memoize uniforms for both cheeks (just color)
    const leftCheekUniforms = useMemo(
      () => ({ uBaseColor: { value: colorObj } }),
      [colorObj]
    );
    const rightCheekUniforms = useMemo(
      () => ({ uBaseColor: { value: accentColor } }),
      [accentColor]
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
  }
);

MeshaCheek.displayName = "MeshaCheek";

export default MeshaCheek;
