import { useRef, forwardRef, useImperativeHandle, useMemo } from "react";
import { extend, useLoader } from "@react-three/fiber";
import { Color, DoubleSide, TextureLoader, ShaderMaterial } from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAppState } from "../../contexts/AppStateContext";
import {
  cheekVertexShader,
  morphologyFragmentShader,
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
    const wordOrder = linguisticProperties?.wordOrder;

    // Load word order texture for shader
    const textureFile = `/textures/${wordOrder?.toLowerCase()}.png`;
    const wordOrderTexture = useLoader(TextureLoader, textureFile);
    // No need to set repeat/offset, shader will handle placement

    // Memoize uniforms for shader
    const shaderUniforms = useMemo(
      () => ({
        uBaseColor: { value: accentColor },
        uAccentColor: { value: colorObj },
        uWordOrderTexture: { value: wordOrderTexture },
        uTextureStart: { value: 0.0 }, // 0.0 = start of reference area
      }),
      [accentColor, colorObj, wordOrderTexture]
    );

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
          scale={[1 / 2, 3 / 4, 1]}
          rotation={[0, 1 / 20, 0]}
        >
          <parametricGeometry
            args={[audioReactiveSurface, segments, segments]}
          />
          <shaderMaterial
            args={[
              {
                uniforms: shaderUniforms,
                vertexShader: cheekVertexShader,
                fragmentShader: morphologyFragmentShader,
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
