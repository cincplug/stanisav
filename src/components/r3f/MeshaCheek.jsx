import { useRef, forwardRef, useImperativeHandle, useMemo } from "react";
import { extend, useLoader } from "@react-three/fiber";
import { Color, DoubleSide, TextureLoader, ShaderMaterial } from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { useAppState } from "../../contexts/AppStateContext";
import {
  cheekVertexShader,
  morphologyFragmentShader,
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
    const wordOrder = linguisticProperties?.wordOrder;
    const morphology = linguisticProperties?.morphology;

    // Load word order texture for right cheek
    const wordOrderTextureFile = `/textures/${wordOrder?.toLowerCase()}.png`;
    const wordOrderTexture = useLoader(TextureLoader, wordOrderTextureFile);

    // Load morphology texture for left cheek
    const morphologyTextureFile = `/textures/${morphology?.toLowerCase()}.png`;
    const morphologyTexture = useLoader(TextureLoader, morphologyTextureFile);

    // Memoize uniforms for right cheek (word order)
    const wordOrderShaderUniforms = useMemo(
      () => ({
        uBaseColor: { value: accentColor },
        uAccentColor: { value: colorObj },
        uWordOrderTexture: { value: wordOrderTexture },
        uTextureStart: { value: 0.0 },
      }),
      [accentColor, colorObj, wordOrderTexture]
    );

    // Memoize uniforms for left cheek (morphology, plain texture)
    const morphologyShaderUniforms = useMemo(
      () => ({
        uTexture: { value: morphologyTexture },
        uBaseColor: { value: colorObj },
      }),
      [morphologyTexture, colorObj]
    );

    return (
      <>
        {/* Left cheek: morphology */}
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
                uniforms: morphologyShaderUniforms,
                vertexShader: cheekVertexShader,
                fragmentShader: plainTextureFragmentShader,
                side: DoubleSide,
                transparent: true,
              },
            ]}
          />
        </mesh>

        {/* Right cheek: word order */}
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
                uniforms: wordOrderShaderUniforms,
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
