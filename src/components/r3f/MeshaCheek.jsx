import { useRef, forwardRef, useImperativeHandle, useMemo } from "react";
import { Color, DoubleSide } from "three";
import { extend } from "@react-three/fiber";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import {
  cheekVertexShader,
  morphologyFragmentShader,
  wordOrderFragmentShader,
} from "../../shaders/cheekShader";

extend({ ParametricGeometry });

import { useAppState } from "../../contexts/AppStateContext";

const MeshaCheek = forwardRef(
  ({ color, languageCode, audioReactiveSurface, segments }, ref) => {
    const mesh1Ref = useRef();
    const mesh2Ref = useRef();

    useImperativeHandle(ref, () => ({
      mesh1: mesh1Ref.current,
      mesh2: mesh2Ref.current,
    }));

    // Get linguisticProperties directly from app state
    const { data } = useAppState();
    const linguisticProperties = data?.typologicalFeatures?.[languageCode];
    const colorObj = new Color(color);
    const accentColor = new Color("#ddddff").sub(colorObj);

    // Extract word order and convert to int array: S=0, O=1, V=2
    const wordOrderStr = linguisticProperties?.wordOrder?.toLowerCase();
    const symbolMap = { s: 0, o: 1, v: 2 };
    const wordOrderArr = wordOrderStr.split("").map((c) => symbolMap[c] ?? 0);

    const shaderUniforms = useMemo(
      () => ({
        uBaseColor: { value: colorObj },
        uAccentColor: { value: accentColor },
        uWordOrder: { value: wordOrderArr },
      }),
      [colorObj, accentColor, wordOrderStr]
    );

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
          <shaderMaterial
            vertexShader={cheekVertexShader}
            fragmentShader={morphologyFragmentShader}
            uniforms={shaderUniforms}
            side={DoubleSide}
          />
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
          <shaderMaterial
            vertexShader={cheekVertexShader}
            fragmentShader={wordOrderFragmentShader}
            uniforms={shaderUniforms}
            side={DoubleSide}
          />
        </mesh>
      </>
    );
  }
);

MeshaCheek.displayName = "MeshaCheek";

export default MeshaCheek;
