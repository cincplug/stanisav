export const plainTextureFragmentShader = /* glsl */ `
  uniform vec3 uBaseColor;
  varying vec3 vNormal;
  void main() {
    vec3 lightDir = normalize(vec3(5.0, 5.0, 5.0));
    float diffuse = max(dot(normalize(vNormal), lightDir), 0.0);
    float ambient = 0.5;
    float lighting = ambient + diffuse * 0.5;
    vec3 color = uBaseColor * lighting;
    gl_FragColor = vec4(color, 1.0);
  }
`;
export const cheekVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const morphologyFragmentShader = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  uniform sampler2D uWordOrderTexture;
  uniform float uTextureStart; // 0.0-1.0, where to start showing the texture along the reference area
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // ========== REFERENCE AREA DEFINITION ==========
    vec2 PATTERN_CENTER = vec2(0.8, 0.5);
    float PATTERN_WIDTH = 0.05;
    float PATTERN_HEIGHT = 0.4;
    float DEPTH_MIN = 0.0;
    float DEPTH_MAX = 0.5;
    // ================================================
    
    // Basic directional lighting
    vec3 lightDir = normalize(vec3(5.0, 5.0, 5.0));
    float diffuse = max(dot(vNormal, lightDir), 0.0);
    float ambient = 0.5;
    float lighting = ambient + diffuse * 0.5;
    
    // Rectangle mask for reference area
    vec2 offset = abs(vUv - PATTERN_CENTER);
    float rectangleX = smoothstep(PATTERN_WIDTH + 0.01, PATTERN_WIDTH, offset.x);
    float rectangleY = smoothstep(PATTERN_HEIGHT + 0.01, PATTERN_HEIGHT, offset.y);
    float rectangle = rectangleX * rectangleY;
    float depthMask = smoothstep(DEPTH_MIN, DEPTH_MAX, vPosition.z);
    rectangle *= depthMask;

    // Only show texture if inside reference area and after uTextureStart (along Y axis)
    float showTexture = step(uTextureStart, (vUv.y - (PATTERN_CENTER.y - PATTERN_HEIGHT)) / (2.0 * PATTERN_HEIGHT));
    showTexture *= rectangle;

    // Map vUv to [0,1] inside the reference area
    vec2 refMin = PATTERN_CENTER - vec2(PATTERN_WIDTH, PATTERN_HEIGHT);
    vec2 refMax = PATTERN_CENTER + vec2(PATTERN_WIDTH, PATTERN_HEIGHT);
    vec2 refUv = (vUv - refMin) / (refMax - refMin);



    // Simplified: (x, y) -> (y, x) achieves the same as previous flip+rotate
    vec2 finalUv = vec2(refUv.y, refUv.x);

    // Sample the texture only if inside the area
    vec4 texColor = texture2D(uWordOrderTexture, finalUv);

    // Compute grayscale value from texture (assume texture is grayscale)
    float texValue = texColor.r;

    // Invert base color
    vec3 invertedBase = vec3(1.0) - uBaseColor;

    // Blend: black (texValue=0) -> inverted, white (texValue=1) -> base, interpolate for gray
    vec3 blendColor = mix(invertedBase, uBaseColor, texValue);

    // Apply blend everywhere on the mesh
    vec3 color = blendColor;
    color *= lighting;
    gl_FragColor = vec4(color, 1.0);
  }
`;
